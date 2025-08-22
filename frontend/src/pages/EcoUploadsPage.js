import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import EXIF from 'exif-js';
import { getDistance } from 'geolib';
import './EcoUploadsPage.css';

// --- MAIN PAGE COMPONENT ---
export default function EcoUploadsPage() {
    const { currentUser } = useAuth();
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const fetchPendingSubmissions = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const q = query(collection(db, "submissions"), where("status", "==", "pending_validation"));
                const querySnapshot = await getDocs(q);
                let submissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPendingSubmissions(submissions);
            } catch (error) {
                console.error("Error fetching pending submissions: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPendingSubmissions();
    }, [currentUser, refresh]);

    const handleVerification = () => setRefresh(prev => prev + 1);

    return (
        <div className="eco-uploads-container">
            <div className="upload-panel">
                <UploaderAndCapture />
            </div>
            <div className="review-panel">
                <h2>Community Submissions to Verify</h2>
                {loading ? <p>Loading submissions...</p> :
                    pendingSubmissions.length > 0 ? (
                        pendingSubmissions.map(sub => (
                            <ReviewCard key={sub.id} submission={sub} onVerify={handleVerification} />
                        ))
                    ) : (
                        <p>No new submissions to verify right now.</p>
                    )
                }
            </div>
        </div>
    );
}

// --- UPLOADER AND CAPTURE COMPONENT ---
const UploaderAndCapture = () => {
    const { currentUser } = useAuth();
    const [mode, setMode] = useState('upload');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);

    // IMPORTANT: Replace with your Cloudinary details
    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dx87689cu/image/upload";
    const CLOUDINARY_UPLOAD_PRESET = "dljw0jaf";

    const resetState = () => {
        setError('');
        setMessage('');
        setIsSubmitting(false);
        stopCamera();
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const handleLiveCapture = async () => {
        resetState();
        setIsSubmitting(true);
        try {
            const userLocation = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }));
            const userCoords = { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude };

            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
            
            const blob = await (await fetch(imageDataUrl)).blob();
            
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            const cloudinaryRes = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
            const cloudinaryData = await cloudinaryRes.json();
            
            await submitToFirestore({
                title: "Live Capture Report",
                description: "User-submitted live camera capture.",
                imageUrl: cloudinaryData.secure_url,
                lat: userCoords.latitude,
                lng: userCoords.longitude,
                captureTime: new Date().toISOString()
            });
            setMessage("Live capture submitted successfully for review!");
        } catch (err) {
            setError(err.message || "Live capture failed.");
        } finally {
            setIsSubmitting(false);
            stopCamera();
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        resetState();
        setIsSubmitting(true);
        try {
            const userLocation = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            const userCoords = { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude };

            const exifData = await new Promise((resolve, reject) => {
                EXIF.getData(file, function() {
                    const lat = EXIF.getTag(this, "GPSLatitude");
                    const lon = EXIF.getTag(this, "GPSLongitude");
                    const dateTime = EXIF.getTag(this, "DateTimeOriginal");
                    if (!lat || !lon || !dateTime) {
                        reject(new Error("Image is missing geotag or date metadata."));
                    } else {
                        resolve({ lat, lon, dateTime });
                    }
                });
            });
            
            const toDecimal = (gpsData) => gpsData[0].numerator + gpsData[1].numerator / (60 * gpsData[1].denominator) + gpsData[2].numerator / (3600 * gpsData[2].denominator);
            const imageCoords = { latitude: toDecimal(exifData.lat), longitude: toDecimal(exifData.lon) };
            
            if (getDistance(userCoords, imageCoords) > 1000) {
                throw new Error(`You must be within 1km of the photo's location.`);
            }
            const captureDate = new Date(exifData.dateTime.replace(":", "-").replace(":", "-"));
            if ((new Date() - captureDate) / (1000 * 3600) > 24) {
                throw new Error("Photo must be from the last 24 hours.");
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            const cloudinaryRes = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
            const cloudinaryData = await cloudinaryRes.json();
            
            await submitToFirestore({
                title: "Geotagged Upload Report",
                description: "User-submitted validated geotagged photo.",
                imageUrl: cloudinaryData.secure_url,
                lat: imageCoords.latitude,
                lng: imageCoords.longitude,
                captureTime: captureDate.toISOString()
            });
            setMessage("Geotagged image submitted successfully for review!");

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
            e.target.value = null;
        }
    };
    
    // Developer Manual Upload Logic
    const handleDeveloperSubmit = async (e) => {
        e.preventDefault();
        resetState();
        setIsSubmitting(true);
        const { title, lat, lng, type, imageUrl } = e.target.elements;
        
        try {
            await submitToFirestore({
                title: title.value,
                description: "Developer-submitted data for testing.",
                imageUrl: imageUrl.value || 'https://via.placeholder.com/300',
                lat: parseFloat(lat.value),
                lng: parseFloat(lng.value),
                captureTime: new Date().toISOString(),
                type: type.value // Crucial for AI model triggering
            });
            setMessage("Developer data submitted successfully for review!");
            e.target.reset();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitToFirestore = (data) => {
        return addDoc(collection(db, "submissions"), {
            ...data,
            submittedByUid: currentUser.uid,
            submittedBy: currentUser.displayName || currentUser.email,
            createdAt: new Date().toISOString(),
            status: "pending_validation",
            verifiedBy: [],
            upvotes: 0,
            downvotes: 0
        });
    };

    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(streamData => {
                setStream(streamData);
                if (videoRef.current) videoRef.current.srcObject = streamData;
            })
            .catch(err => setError("Could not access camera."));
    };
    
    useEffect(() => {
        if (mode === 'capture' && !stream) {
            startCamera();
        } else if (mode !== 'capture' && stream) {
            stopCamera();
        }
        return stopCamera;
    }, [mode, stream, stopCamera]);

    return (
        <div className="uploader-card">
            <div className="mode-selector">
                <button onClick={() => setMode('upload')} className={mode === 'upload' ? 'active' : ''}>Upload</button>
                <button onClick={() => setMode('capture')} className={mode === 'capture' ? 'active' : ''}>Live Capture</button>
                <button onClick={() => setMode('developer')} className={mode === 'developer' ? 'active' : ''}>Dev Tool</button>
            </div>

            {mode === 'upload' && (
                <div>
                    <h3>Upload Geotagged Image</h3>
                    <p>Select a valid geotagged photo from your device.</p>
                    <input type="file" id="file-upload" accept="image/jpeg, image/jpg" onChange={handleFileUpload} disabled={isSubmitting} />
                    <label htmlFor="file-upload" className={`custom-file-upload ${isSubmitting ? 'disabled' : ''}`}>
                       {isSubmitting ? 'Processing...' : 'Select Geotagged Image'}
                    </label>
                </div>
            )}
            
            {mode === 'capture' && (
                <div>
                    <h3>Live Camera Capture</h3>
                    <div className="camera-view">
                        <video ref={videoRef} autoPlay playsInline muted></video>
                        <canvas ref={canvasRef} style={{display: 'none'}}></canvas>
                    </div>
                    <button onClick={handleLiveCapture} disabled={isSubmitting || !stream} className="capture-btn">
                        {isSubmitting ? "Submitting..." : "Capture & Submit"}
                    </button>
                </div>
            )}

            {mode === 'developer' && (
                <div>
                    <h3>Developer Manual Upload</h3>
                    <p>Bypass validation to add test data. This is crucial for the demo.</p>
                    <form className="dev-form" onSubmit={handleDeveloperSubmit}>
                        <input name="title" placeholder="Title (e.g., Illegal Logging)" required />
                        <input name="lat" placeholder="Latitude (e.g., 28.6139)" required type="number" step="any" />
                        <input name="lng" placeholder="Longitude (e.g., 77.2090)" required type="number" step="any" />
                        <select name="type" required>
                            <option value="">Select Threat Type...</option>
                            <option value="deforestation">Deforestation</option>
                            <option value="plastic">Plastic Waste</option>
                            <option value="coral">Coral Bleaching</option>
                        </select>
                        <input name="imageUrl" placeholder="Optional Image URL" />
                        <button type="submit" disabled={isSubmitting}>Submit Test Data</button>
                    </form>
                </div>
            )}
            {error && <p className="message error-message">{error}</p>}
            {message && <p className="message success-message">{message}</p>}
        </div>
    );
};

const ReviewCard = ({ submission, onVerify }) => {
    const { currentUser } = useAuth();
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async (isAuthentic) => {
        if (!currentUser || submission.verifiedBy.includes(currentUser.uid)) return;
        setIsVerifying(true);
        try {
            const submissionRef = doc(db, "submissions", submission.id);
            const voteField = isAuthentic ? "upvotes" : "downvotes";
            
            await updateDoc(submissionRef, {
                verifiedBy: arrayUnion(currentUser.uid),
                [voteField]: (submission[voteField] || 0) + 1
            });
            
            if ((submission.upvotes + 1) >= 3 && isAuthentic) {
                await updateDoc(submissionRef, { status: "validated" });
            } else if ((submission.downvotes + 1) >= 3 && !isAuthentic) {
                await updateDoc(submissionRef, { status: "rejected" });
            }
            onVerify();
        } catch (error) {
            console.error("Error verifying submission: ", error);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="review-card">
            <img src={submission.imageUrl} alt={submission.title} />
            <div className="review-info">
                <h4>{submission.title}</h4>
                <p><strong>Submitted by:</strong> {submission.submittedBy}</p>
                <p><strong>Location:</strong> {submission.lat.toFixed(4)}, {submission.lng.toFixed(4)}</p>
                <div className="review-buttons">
                    <button onClick={() => handleVerify(true)} disabled={isVerifying || submission.verifiedBy.includes(currentUser.uid)}>Authentic</button>
                    <button onClick={() => handleVerify(false)} disabled={isVerifying || submission.verifiedBy.includes(currentUser.uid)} className="reject">Inauthentic</button>
                </div>
            </div>
        </div>
    );
};