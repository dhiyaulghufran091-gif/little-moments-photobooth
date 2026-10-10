const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const countdown = document.getElementById("countdown");

const startCamera = document.getElementById("startCamera");
const takePhoto = document.getElementById("takePhoto");
const download = document.getElementById("download");
const result = document.getElementById("result");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");

const frameOptions = document.querySelectorAll(".frame-option");

const nameOne = document.getElementById("nameOne");
const nameTwo = document.getElementById("nameTwo");
const specialDate = document.getElementById("specialDate");
const captionInput = document.getElementById("caption");

let cameraStream = null;
let photos = [];
let selectedFrame = "pink";
let isCapturing = false;

const themes = {
    pink: {
        background: "#fff0f5",
        border: "#e89bb5",
        title: "#c45f87",
        text: "#a66f84",
        filter: "saturate(1.08)"
    },
    bw: {
        background: "#f3f1ec",
        border: "#292929",
        title: "#222222",
        text: "#555555",
        filter: "grayscale(100%)"
    },
    retro: {
        background: "#f1dfbd",
        border: "#a87545",
        title: "#85572f",
        text: "#98734f",
        filter: "sepia(65%) contrast(1.04)"
    }
};

// TANGGAL DEFAULT = HARI INI
const today = new Date();

specialDate.value = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

// MEMILIH FRAME
frameOptions.forEach(button => {
    button.addEventListener("click", () => {
        if (isCapturing) return;

        selectedFrame = button.dataset.frame;

        frameOptions.forEach(option => {
            const active = option === button;

            option.classList.toggle("active", active);
            option.setAttribute("aria-pressed", String(active));
        });

        updatePhotoPreview();

        countdown.textContent = {
            pink: "Pink Aesthetic ♡",
            bw: "Black & White ✦",
            retro: "Retro Vintage ✷"
        }[selectedFrame];
    });
});

// MENYALAKAN KAMERA
startCamera.addEventListener("click", async () => {
    if (cameraStream) return;

    try {
        startCamera.disabled = true;
        startCamera.textContent = "MEMBUKA KAMERA...";

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });

        camera.srcObject = cameraStream;
        await camera.play();

        cameraPlaceholder.hidden = true;

        startCamera.textContent = "KAMERA AKTIF ✓";
        takePhoto.disabled = false;

        countdown.textContent = "Senyum dulu, ya! ♡";

    } catch (error) {
        console.error("Kamera:", error);

        cameraStream = null;
        startCamera.disabled = false;
        startCamera.textContent = "♡ Nyalakan Kamera";

        alert("Kamera gagal dibuka. Periksa izin kamera Firefox.");
    }
});

// MENGAMBIL EMPAT FOTO
takePhoto.addEventListener("click", async () => {
    if (!cameraStream || isCapturing) return;

    isCapturing = true;

    takePhoto.disabled = true;
    startCamera.disabled = true;
    download.hidden = true;

    photos = [];
    result.innerHTML = "";

    try {
        for (let i = 0; i < 4; i++) {
            for (let n = 3; n >= 1; n--) {
                countdown.textContent = n;
                await wait(1000);
            }

            countdown.textContent = "♡";
            await wait(300);

            if (!camera.videoWidth || !camera.videoHeight) {
                throw new Error("Kamera belum siap.");
            }

            canvas.width = camera.videoWidth;
            canvas.height = camera.videoHeight;

            const ctx = canvas.getContext("2d");

            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);

            ctx.drawImage(
                camera,
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.restore();

            photos.push(canvas.toDataURL("image/png"));

            const img = document.createElement("img");
            img.alt = `Foto ${i + 1}`;

            result.appendChild(img);
            updatePhotoPreview();

            countdown.textContent = `Foto ${i + 1} dari 4 ♡`;

            await wait(500);
        }

        countdown.textContent = "Captured with love ♡";
        download.hidden = false;

    } catch (error) {
        console.error("Mengambil foto:", error);

        alert("Ada masalah mengambil foto. Coba lagi, ya!");

    } finally {
        isCapturing = false;
        takePhoto.disabled = !cameraStream;
        startCamera.disabled = Boolean(cameraStream);

        startCamera.textContent = cameraStream
            ? "KAMERA AKTIF ✓"
            : "♡ Nyalakan Kamera";
    }
});

// PREVIEW FOTO
function updatePhotoPreview() {
    const theme = themes[selectedFrame];

    result.querySelectorAll("img").forEach((img, index) => {
        if (photos[index]) {
            img.src = photos[index];
        }

        img.style.filter = theme.filter;
    });
}

// MEMBUAT PHOTO STRIP
download.addEventListener("click", async () => {
    if (photos.length !== 4) {
        alert("Ambil empat foto terlebih dahulu!");
        return;
    }

    download.disabled = true;
    download.textContent = "MEMBUAT PHOTO STRIP...";

    try {
        const images = await Promise.all(photos.map(loadImage));

        const theme = themes[selectedFrame];

        // Ambil teks dari formulir
        const firstName = nameOne.value.trim();
        const secondName = nameTwo.value.trim();

        const names = [firstName, secondName]
            .filter(Boolean)
            .join("  ♡  ");

        const caption = captionInput.value.trim()
            || "You & Me, Always ♡";

        const dateValue = specialDate.value;

        let formattedDate = "";

        if (dateValue) {
            const parts = dateValue.split("-").map(Number);

            const date = new Date(
                parts[0],
                parts[1] - 1,
                parts[2]
            );

            formattedDate = date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
        }

        const strip = document.createElement("canvas");
        const ctx = strip.getContext("2d");

        const W = 720;
        const H = 2200;
        const side = 64;
        const photoW = W - side * 2;
        const photoH = 340;
        const gap = 22;
        const photoStartY = 350;
        const footerY = 1855;

        strip.width = W;
        strip.height = H;

        // BACKGROUND
        ctx.fillStyle = theme.background;
        ctx.fillRect(0, 0, W, H);

        // BORDER LUAR
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = selectedFrame === "bw" ? 12 : 3;

        ctx.strokeRect(
            18,
            18,
            W - 36,
            H - 36
        );

        // DEKORASI LATAR
        if (selectedFrame === "pink") {
            drawPinkBackground(ctx, W, H);
        } else if (selectedFrame === "bw") {
            drawBlackWhiteBackground(ctx, W, H);
        } else {
            drawRetroBackground(ctx, W, H);
        }

        // JUDUL
        ctx.textAlign = "center";
        ctx.fillStyle = theme.title;

        ctx.font = selectedFrame === "bw"
            ? "bold 45px Georgia"
            : "italic 54px Georgia";

        ctx.fillText(
            selectedFrame === "retro"
                ? "Sweet Memories"
                : "little moments",
            W / 2,
            95
        );

        ctx.font = "17px sans-serif";

        ctx.fillText(
            selectedFrame === "bw"
                ? "MOMENTS IN MONOCHROME"
                : selectedFrame === "retro"
                    ? "A MEMORY TO KEEP"
                    : "A LITTLE MEMORY TO KEEP",
            W / 2,
            137
        );

        // NAMA CUSTOM
        ctx.fillStyle = theme.title;
        ctx.font = "bold 28px Georgia";

        if (names) {
            drawWrappedText(
                ctx,
                names,
                W / 2,
                202,
                W - 90,
                36,
                2
            );
        } else {
            ctx.font = "italic 24px Georgia";
            ctx.fillText("a moment just for you ♡", W / 2, 202);
        }

        // TANGGAL SPESIAL
        if (formattedDate) {
            ctx.fillStyle = theme.text;
            ctx.font = "17px sans-serif";

            ctx.fillText(
                formattedDate,
                W / 2,
                247
            );
        }

        // ORNAMEN JUDUL
        if (selectedFrame === "pink") {
            drawFlower(ctx, 80, 90, 20, "#ee9bb8", "#f8d5a5");
            drawFlower(ctx, 640, 95, 18, "#e89bb5", "#f8d5a5");
            drawHeart(ctx, 580, 190, 17, "#e58eae");
            drawHeart(ctx, 130, 195, 13, "#e58eae");

        } else if (selectedFrame === "bw") {
            drawStar(ctx, 82, 100, 22, "#252525");
            drawStar(ctx, 640, 150, 18, "#252525");
            drawHeart(ctx, 95, 200, 16, "#252525");

        } else {
            drawFlower(ctx, 82, 100, 22, "#c88c4b", "#e7c77f");
            drawFlower(ctx, 636, 110, 19, "#c88c4b", "#e7c77f");
            drawSparkle(ctx, 600, 195, 16, "#a87545");
        }

        // EMPAT FOTO
        images.forEach((img, index) => {
            const x = side;
            const y = photoStartY + index * (photoH + gap);

            // Bayangan
            ctx.save();

            ctx.shadowColor = "#77505b25";
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 4;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(
                x - 5,
                y - 5,
                photoW + 10,
                photoH + 10
            );

            ctx.restore();

            // Efek gambar
            ctx.save();
            ctx.filter = theme.filter;

            drawCover(
                ctx,
                img,
                x,
                y,
                photoW,
                photoH
            );

            ctx.restore();

            // Border foto
            ctx.strokeStyle = theme.border;
            ctx.lineWidth = selectedFrame === "bw" ? 4 : 2;

            ctx.strokeRect(x, y, photoW, photoH);

            // Nomor foto
            ctx.fillStyle = selectedFrame === "bw"
                ? "#222222"
                : "#ffffff";

            ctx.fillRect(x + 12, y + 12, 42, 34);

            ctx.fillStyle = selectedFrame === "bw"
                ? "#ffffff"
                : theme.title;

            ctx.font = "bold 18px sans-serif";

            ctx.fillText(
                `0${index + 1}`,
                x + 33,
                y + 35
            );

            // Dekorasi tiap foto
            if (selectedFrame === "pink") {
                drawHeart(
                    ctx,
                    W - 92,
                    y + photoH - 28,
                    15,
                    "#ffffff"
                );

            } else if (selectedFrame === "bw") {
                drawStar(
                    ctx,
                    W - 91,
                    y + photoH - 27,
                    13,
                    "#ffffff"
                );

            } else {
                drawSparkle(
                    ctx,
                    W - 92,
                    y + photoH - 28,
                    14,
                    "#f7e5c3"
                );
            }
        });

        // ORNAMEN FOOTER
        if (selectedFrame === "pink") {
            drawFlower(ctx, 100, footerY + 10, 26, "#e89bb5", "#f8d5a5");
            drawFlower(ctx, 620, footerY + 10, 24, "#e89bb5", "#f8d5a5");
            drawHeart(ctx, 170, footerY + 70, 13, "#d8799d");
            drawHeart(ctx, 550, footerY + 70, 13, "#d8799d");
            drawBow(ctx, W / 2, footerY + 90, "#d8799d");

        } else if (selectedFrame === "bw") {
            drawStar(ctx, 100, footerY + 30, 23, "#292929");
            drawStar(ctx, 620, footerY + 30, 23, "#292929");

            ctx.fillStyle = "#292929";
            ctx.fillRect(65, footerY + 85, 70, 10);
            ctx.fillRect(W - 135, footerY + 85, 70, 10);

        } else {
            drawFlower(ctx, 100, footerY + 25, 25, "#c88c4b", "#e7c77f");
            drawFlower(ctx, 620, footerY + 25, 25, "#c88c4b", "#e7c77f");
            drawSparkle(ctx, 165, footerY + 70, 20, "#a87545");
            drawSparkle(ctx, 555, footerY + 70, 20, "#a87545");
        }

        // CAPTION CUSTOM
        ctx.fillStyle = theme.title;
        ctx.textAlign = "center";
        ctx.font = selectedFrame === "bw"
            ? "bold 25px Georgia"
            : "italic 29px Georgia";

        drawWrappedText(
            ctx,
            caption,
            W / 2,
            footerY + 35,
            W - 140,
            36,
            2
        );

        // TANGGAL SUDAH DITAMPILKAN DI ATAS.
        // FOOTER KECIL
        ctx.fillStyle = theme.text;
        ctx.font = "13px sans-serif";

        ctx.fillText(
            selectedFrame === "pink"
                ? "PINK AESTHETIC  ♡"
                : selectedFrame === "bw"
                    ? "CLASSIC MONOCHROME"
                    : "RETRO VINTAGE",
            W / 2,
            H - 52
        );

        // DOWNLOAD
        const link = document.createElement("a");

        link.download = `little-moments-${selectedFrame}.png`;
        link.href = strip.toDataURL("image/png");

        document.body.appendChild(link);
        link.click();
        link.remove();

    } catch (error) {
        console.error("Membuat strip:", error);

        alert("Gagal membuat strip foto. Coba lagi, ya!");

    } finally {
        download.disabled = false;
        download.textContent = "↓ Download Photo Strip";
    }
});

// MEMBUAT TEKS PANJANG TETAP MUAT
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";

    for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;

        if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    }

    if (line) lines.push(line);

    let visibleLines = lines.slice(0, maxLines);

    if (lines.length > maxLines && visibleLines.length) {
        let last = visibleLines[maxLines - 1];

        while (
            last.length > 1 &&
            ctx.measureText(last + "…").width > maxWidth
        ) {
            last = last.slice(0, -1);
        }

        visibleLines[maxLines - 1] = last + "…";
    }

    const startY = y - ((visibleLines.length - 1) * lineHeight) / 2;

    visibleLines.forEach((textLine, index) => {
        ctx.fillText(textLine, x, startY + index * lineHeight);
    });
}

// BUNGA
function drawFlower(ctx, x, y, size, petalColor, centerColor) {
    ctx.save();
    ctx.translate(x, y);

    for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);

        ctx.beginPath();
        ctx.ellipse(
            0,
            -size * 0.48,
            size * 0.24,
            size * 0.42,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = petalColor;
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = centerColor;
    ctx.fill();

    ctx.restore();
}

// HATI
function drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 30, size / 30);

    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-28, -8, -15, -24, 0, -10);
    ctx.bezierCurveTo(15, -24, 28, -8, 0, 10);

    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
}

// BINTANG
function drawStar(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();

    for (let i = 0; i < 10; i++) {
        const angle = -Math.PI / 2 + i * Math.PI / 5;
        const radius = i % 2 === 0 ? size : size * 0.42;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
}

// SPARKLE
function drawSparkle(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.12, -size * 0.12, size, 0);
    ctx.quadraticCurveTo(size * 0.12, size * 0.12, 0, size);
    ctx.quadraticCurveTo(-size * 0.12, size * 0.12, -size, 0);
    ctx.quadraticCurveTo(-size * 0.12, -size * 0.12, 0, -size);

    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
}

// PITA
function drawBow(ctx, x, y, color) {
    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 35, y - 30, x - 60, y - 5, x - 15, y + 5);
    ctx.bezierCurveTo(x - 5, y + 8, x - 5, y - 2, x, y);

    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 35, y - 30, x + 60, y - 5, x + 15, y + 5);
    ctx.bezierCurveTo(x + 5, y + 8, x + 5, y - 2, x, y);

    ctx.moveTo(x - 4, y + 3);
    ctx.lineTo(x - 15, y + 35);

    ctx.moveTo(x + 4, y + 3);
    ctx.lineTo(x + 15, y + 35);

    ctx.stroke();
    ctx.restore();
}

// DEKORASI PINK
function drawPinkBackground(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.5;

    for (let i = 0; i < 12; i++) {
        const x = 35 + (i % 2) * (width - 70);
        const y = 280 + i * 130;

        drawSparkle(
            ctx,
            x,
            y,
            6 + (i % 3) * 2,
            "#e9a0ba"
        );
    }

    ctx.restore();
}

// DEKORASI HITAM PUTIH
function drawBlackWhiteBackground(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = "#252525";

    ctx.fillRect(70, 18, 95, 20);
    ctx.fillRect(width - 165, 18, 95, 20);

    ctx.strokeStyle = "#252525";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(35, 300);
    ctx.lineTo(50, 315);
    ctx.lineTo(35, 330);

    ctx.moveTo(width - 35, 300);
    ctx.lineTo(width - 50, 315);
    ctx.lineTo(width - 35, 330);

    ctx.stroke();
    ctx.restore();
}

// DEKORASI RETRO
function drawRetroBackground(ctx, width, height) {
    ctx.save();

    ctx.strokeStyle = "#c5a477";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 7]);

    ctx.strokeRect(32, 280, width - 64, height - 460);

    ctx.setLineDash([]);
    ctx.fillStyle = "#a87545";

    for (let y = 350; y < height - 300; y += 50) {
        ctx.fillRect(27, y, 9, 22);
        ctx.fillRect(width - 36, y, 9, 22);
    }

    ctx.restore();
}

// MEMUAT GAMBAR
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// FOTO MEMENUHI BINGKAI
function drawCover(ctx, img, x, y, width, height) {
    const scale = Math.max(
        width / img.width,
        height / img.height
    );

    const sourceWidth = width / scale;
    const sourceHeight = height / scale;

    const sourceX = (img.width - sourceWidth) / 2;
    const sourceY = (img.height - sourceHeight) / 2;

    ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        x,
        y,
        width,
        height
    );
}

// JEDA COUNTDOWN
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// KONDISI AWAL
takePhoto.disabled = true;
download.hidden = true;
