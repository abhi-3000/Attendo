import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

const FacultyQRGenerator = ({ courseId }) => {
  const [qrData, setQrData] = useState("");
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) =>
          console.error(
            "Error getting location. Please allow GPS permissions.",
          ),
      );
    }
  }, []);

  useEffect(() => {
    if (!location) return;

    const generateQR = () => {
      const payload = {
        courseId,
        facultyLat: location.lat,
        facultyLng: location.lng,
        timestamp: Date.now(),
      };
      setQrData(JSON.stringify(payload));
    };

    generateQR();
    const interval = setInterval(generateQR, 10000);
    return () => clearInterval(interval);
  }, [courseId, location]);

  if (!location) {
    return (
      <div className="p-4 text-center text-slate-500">
        Getting GPS location. Please allow location access in your browser.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm text-center border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        Class Attendance QR
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Ask students to scan this. It refreshes every 10 seconds for security.
      </p>
      <div className="flex justify-center p-4 bg-slate-50 rounded-lg inline-block border-2 border-slate-100">
        {qrData && <QRCodeSVG value={qrData} size={256} />}
      </div>
    </div>
  );
};

export default FacultyQRGenerator;
