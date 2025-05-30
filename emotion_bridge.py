# emotion_bridge.py
import cv2, serial, time
from deepface import DeepFace

PORT      = '/dev/cu.usbmodem143101'  # Adjust this to your serial port
BAUD      = 115200
SEND_EVERY = 0.4 

EMO_MAP = {
    "happy"   : "HAPPY",
    "fear"    : "SCARED",
    "angry"   : "SCARED",
    "surprise": "SCARED",
    "sad"     : "CALM",
    "neutral" : "CALM",
    "disgust" : "CALM"
}

ser  = serial.Serial(PORT, BAUD, timeout=1)

cap  = cv2.VideoCapture(0)
last_cmd, last_time = None, 0

print("Press q to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    try:
        result  = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['dominant_emotion']
        cmd     = EMO_MAP.get(emotion, "CALM")
    except Exception as e:
        print("DeepFace error:", e)
        cmd = "CALM"

    now = time.time()
    if cmd != last_cmd or now - last_time > SEND_EVERY:
        if ser and ser.is_open and (cmd != last_cmd or now - last_time > SEND_EVERY):
            try:
                ser.write((cmd + "\n").encode())
                print("Sent:", cmd)
                last_cmd, last_time = cmd, now
            except serial.SerialException as e:
                print("Serial write error:", e)

        ser.write((cmd + "\n").encode())
        print("Sent:", cmd)
        last_cmd, last_time = cmd, now

    cv2.putText(frame, f'Emotion: {emotion}', (30, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
    cv2.imshow("Emotion detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release();  cv2.destroyAllWindows()
ser.close()

