
// ======================================
// NEON ROVER - ESP32 DASHBOARD
// ======================================

let espIP = "";

// AMBIL ALAMAT ESP32
function getAddress() {
    espIP = document.getElementById("espIP").value.trim();

    if (!espIP.startsWith("http://") &&
        !espIP.startsWith("https://")) {
        espIP = "http://" + espIP;
    }

    espIP = espIP.replace(/\/$/, "");
    return espIP;
}

// KIRIM PERINTAH KE ESP32
async function sendCommand(path) {
    if (!espIP) {
        getAddress();
    }

    try {
        const response = await fetch(espIP + path);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        return await response.text();

    } catch (error) {
        console.error("Gagal mengirim perintah:", error);
        document.getElementById("connection").textContent =
            "● CONNECTION ERROR";
        document.getElementById("connection").style.color =
            "#ff526d";
    }
}

// KONEKSI ROBOT
async function connectRobot() {
    getAddress();
    await updateStatus();
}

// KONTROL MOTOR
function move(direction) {
    sendCommand("/api/cmd?m=" + direction);
}

// KECEPATAN MOTOR
function setSpeed(value) {
    document.getElementById("speedValue").textContent =
        value + " / 255";

    sendCommand("/api/speed?v=" + value);
}

// KONTROL SERVO
function setServo(id, value) {
    if (id === "capit") {
        document.getElementById("capitValue").textContent =
            value + "°";
    }

    if (id === "lift") {
        document.getElementById("liftValue").textContent =
            value + "°";
    }

    sendCommand(
        "/api/servo?id=" + id + "&v=" + value
    );
}

// MEMBACA DATA ESP32
async function updateStatus() {
    if (!espIP) return;

    try {
        const response = await fetch(
            espIP + "/api/status",
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("ESP32 tidak merespons");
        }

        const data = await response.json();

        // STATUS KONEKSI
        document.getElementById("connection").textContent =
            "● ROBOT CONNECTED";

        document.getElementById("connection").style.color =
            "#42efae";

        // SUHU OBJEK
        document.getElementById("temperature").textContent =
            data.temperature === null
                ? "--.-"
                : Number(data.temperature).toFixed(1);

        // SUHU LINGKUNGAN
        document.getElementById("ambient").textContent =
            data.ambient === null
                ? "--.- °C"
                : Number(data.ambient).toFixed(1) + " °C";

        // JAM DAN TANGGAL
        if (data.time && data.time !== "RTC_ERROR") {
            const waktu = data.time.split(" ");

            document.getElementById("clock").textContent =
                waktu[1] || "--:--:--";

            document.getElementById("date").textContent =
                waktu[0] || "Tanggal tidak tersedia";
        }

        // STATUS MOTOR
        document.getElementById("motor").textContent =
            data.motor;

        // STATUS MICRO SD
        document.getElementById("sd").textContent =
            data.sd;

        // STATUS SENSOR SUHU
        document.getElementById("mlx").textContent =
            data.mlx;

        // STATUS RTC
        document.getElementById("rtc").textContent =
            data.rtc;

    } catch (error) {
        console.error("Status gagal dibaca:", error);

        document.getElementById("connection").textContent =
            "● DISCONNECTED";

        document.getElementById("connection").style.color =
            "#ff526d";
    }
}

function holdMove(event, direction) {
    event.preventDefault();
    move(direction);
}

function stopMove() {
    move('X');
}

document.addEventListener("pointerup", stopMove);
document.addEventListener("pointercancel", stopMove);

// UPDATE DATA SETIAP 1 DETIK
setInterval(updateStatus, 1000);

// ======================================
// END NEON ROVER
// ======================================
