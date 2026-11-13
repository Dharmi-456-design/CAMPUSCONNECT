import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import Icon from "../../components/common/Icon";

export default function CameraScreen({ onBack, onSavePhoto }) {
  const { theme: C, isDark } = useTheme();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [photoUri, setPhotoUri] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("user");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [stream, setStream] = useState(null);

  // Web: start camera stream
  const startCamera = async () => {
    if (Platform.OS !== "web") return;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
      setIsStreaming(true);
      setPermissionDenied(false);
    } catch (e) {
      setPermissionDenied(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [cameraFacing]);

  const handleTakePhoto = () => {
    if (Platform.OS !== "web") return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setPhotoUri(dataUrl);
  };

  const handleSwitchCamera = () => {
    stopCamera();
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleSave = () => {
    if (onSavePhoto && photoUri) onSavePhoto(photoUri);
  };

  const handleClear = () => setPhotoUri(null);

  if (permissionDenied) {
    return (
      <View style={[styles.container, { backgroundColor: C.bg }]}>
        <View style={styles.permissionBox}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2" }]}>
            <Icon name="camera-off" size={32} color="#EF4444" />
          </View>
          <Text style={[styles.permTitle, { color: C.textPrimary }]}>Camera Access Denied</Text>
          <Text style={[styles.permSub, { color: C.textMuted }]}>
            Please allow camera access in your browser settings and reload the page.
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#16A36A" }]}
            onPress={startCamera}
          >
            <Text style={styles.btnText}>Retry</Text>
          </TouchableOpacity>
          {onBack && (
            <TouchableOpacity style={[styles.btn, { backgroundColor: C.bgSubtle, marginTop: 8 }]} onPress={onBack}>
              <Text style={[styles.btnText, { color: C.textPrimary }]}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.navBg, borderBottomColor: C.border }]}>
        {onBack && (
          <TouchableOpacity onPress={() => { stopCamera(); onBack(); }} style={styles.backBtn} activeOpacity={0.8}>
            <Icon name="arrow-left" size={18} color={C.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.logoBadge}>
          <Icon name="camera" size={14} color="#FFF" />
        </View>
        <Text style={[styles.title, { color: C.textPrimary }]}>Campus Camera</Text>
      </View>

      {/* Camera viewport - Web only via HTML5 */}
      {Platform.OS === "web" && (
        <View style={styles.cameraBox}>
          {!photoUri ? (
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 16,
                transform: cameraFacing === "user" ? "scaleX(-1)" : "none",
              }}
              autoPlay
              playsInline
              muted
            />
          ) : (
            <Image source={{ uri: photoUri }} style={styles.previewImg} />
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Overlay Controls */}
          {!photoUri && (
            <View style={styles.overlayControls}>
              <TouchableOpacity
                style={[styles.overlayBtn, { backgroundColor: "rgba(0,0,0,0.5)" }]}
                onPress={handleSwitchCamera}
              >
                <Icon name="refresh-cw" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Bottom Controls */}
      <View style={[styles.controls, { backgroundColor: C.bgCard, borderTopColor: C.border }]}>
        {!photoUri ? (
          <View style={styles.captureRow}>
            <View style={{ width: 48 }} />
            {/* Shutter button */}
            <TouchableOpacity style={styles.shutterOuter} onPress={handleTakePhoto} activeOpacity={0.85}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sideBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
              onPress={handleSwitchCamera}
              activeOpacity={0.8}
            >
              <Icon name="refresh-cw" size={16} color={C.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
              onPress={handleClear}
            >
              <Icon name="trash-2" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: C.textPrimary }]}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#16A36A" }]}
              onPress={handleSave}
            >
              <Icon name="download" size={16} color="#FFF" />
              <Text style={[styles.actionText, { color: "#FFF" }]}>Save Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: { padding: 4 },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#16A36A",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "700" },
  cameraBox: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative",
  },
  previewImg: { width: "100%", height: "100%", resizeMode: "cover" },
  overlayControls: {
    position: "absolute",
    top: 12,
    right: 12,
    gap: 8,
  },
  overlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: "#16A36A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#16A36A",
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  previewActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  actionText: { fontSize: 14, fontWeight: "700" },
  permissionBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permTitle: { fontSize: 20, fontWeight: "800", marginBottom: 10, textAlign: "center" },
  permSub: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  btnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
});
