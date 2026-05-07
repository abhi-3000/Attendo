import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useMarkGeofencedAttendanceMutation } from "../features/api/apiSlice";

const StudentQRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [markAttendance] = useMarkGeofencedAttendanceMutation();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        setScanResult(decodedText);
        setStatusMsg("QR Scanned! Fetching your GPS location...");

        try {
          const qrData = JSON.parse(decodedText);

          if (Date.now() - qrData.timestamp > 15000) {
            setStatusMsg(
              "This QR code has expired. Please scan the latest one on the screen.",
            );
            return;
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              setStatusMsg("Location found. Verifying distance...");
              try {
                const response = await markAttendance({
                  courseId: qrData.courseId,
                  facultyLat: qrData.facultyLat,
                  facultyLng: qrData.facultyLng,
                  studentLat: position.coords.latitude,
                  studentLng: position.coords.longitude,
                }).unwrap();

                setStatusMsg("Success: " + response.message);
              } catch (err) {
                setStatusMsg(
                  "Error: " + (err.data?.error || "Failed to mark attendance"),
                );
              }
            },
            (error) => {
              setStatusMsg(
                "Error: You must allow GPS location to mark attendance.",
              );
            },
          );
        } catch (e) {
          setStatusMsg(
            "Invalid QR Code. Please scan the correct Attendo code.",
          );
        }
      },
      (error) => {
        // We ignore background scanning errors to keep the console clean
      },
    );

    return () => {
      scanner.clear().catch((e) => console.log("Scanner cleared."));
    };
  }, [markAttendance]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm text-center border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        Scan Attendance QR
      </h2>
      {!scanResult ? (
        <div
          id="reader"
          className="mx-auto max-w-sm overflow-hidden rounded-lg"
        ></div>
      ) : (
        <div className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-lg text-lg font-medium text-slate-800">
          {statusMsg}
          <button
            onClick={() => {
              setScanResult(null);
              setStatusMsg("");
            }}
            className="mt-4 block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentQRScanner;
