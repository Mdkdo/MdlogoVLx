class Turtle {
    constructor(canvas, turtleLayer) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.turtleLayer = turtleLayer;
        this.turtleCtx = turtleLayer ? turtleLayer.getContext('2d') : null;
        this.turtleImage = null;
        this.turtleStyle = 'default';
        this.activeVideo = null;
        this.activeVideoFrame = null;
        this.activeAudio = null;
        this.reset();
    }

    reset() {
        this.originX = this.canvas.width / 2;
        this.originY = this.canvas.height / 2;
        this.x = 0; // Relative to origin
        this.y = 0; // Relative to origin
        this.angle = Math.PI / 2; // Pointing up (90 degrees in math sense if Y is up)
        this.isProcessing = false;
        this.commandQueue = [];
        this.penDown = true;
        this.color = '#000000';
        this.fillColor = '#000000';
        this.width = 1;
        this.visible = true;
        this.fontSize = 12;
        this.fontFamily = 'Arial';
        this.fontWeight = 'normal';
        this.fontStyle = 'normal';
        this.updateFont();
        this.speed = 1000; // Fast by default
        this.isDrawingSmooth = false;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.currentPath = new Path2D();
        this.currentPath.moveTo(this.originX + this.x, this.originY - this.y);
        
        if (this.turtleCtx) {
            this.draw();
        }
    }

    resize(width, height) {
        const nextWidth = Math.max(1, Math.round(width));
        const nextHeight = Math.max(1, Math.round(height));
        if (this.canvas.width === nextWidth && this.canvas.height === nextHeight) {
            this.draw();
            return;
        }

        this.canvas.width = nextWidth;
        this.canvas.height = nextHeight;
        if (this.turtleLayer) {
            this.turtleLayer.width = nextWidth;
            this.turtleLayer.height = nextHeight;
        }

        this.originX = nextWidth / 2;
        this.originY = nextHeight / 2;

        this.ctx.clearRect(0, 0, nextWidth, nextHeight);
        this.currentPath = new Path2D();
        this.currentPath.moveTo(this.originX + this.x, this.originY - this.y);
        this.draw();
    }

    fd(dist) {
        if (this.isDrawingSmooth) {
            this.commandQueue.push({ type: 'fd', dist });
            this.processQueue();
            return;
        }
        const newX = this.x + dist * Math.cos(this.angle);
        const newY = this.y + dist * Math.sin(this.angle);
        
        if (this.penDown) {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(this.originX + this.x, this.originY - this.y);
            this.ctx.lineTo(this.originX + newX, this.originY - newY);
            this.ctx.stroke();
            this.currentPath.lineTo(this.originX + newX, this.originY - newY);
        } else {
            this.currentPath.moveTo(this.originX + newX, this.originY - newY);
        }
        
        this.x = newX;
        this.y = newY;
        this.draw();
    }

    bk(dist) {
        this.fd(-dist);
    }

    rt(deg) {
        if (this.isDrawingSmooth) {
            this.commandQueue.push({ type: 'rt', deg });
            this.processQueue();
            return;
        }
        // Turtle rt is clockwise. If Y is up, clockwise rotation decreases the math angle.
        this.angle -= (deg * Math.PI) / 180;
        this.draw();
    }

    lt(deg) {
        if (this.isDrawingSmooth) {
            this.commandQueue.push({ type: 'lt', deg });
            this.processQueue();
            return;
        }
        this.angle += (deg * Math.PI) / 180;
        this.draw();
    }

    pu() {
        this.penDown = false;
    }

    pd() {
        this.penDown = true;
    }

    cs() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.currentPath = new Path2D();
        this.home();
    }

    clean() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.currentPath = new Path2D();
        this.currentPath.moveTo(this.originX + this.x, this.originY - this.y);
    }

    home() {
        this.x = 0;
        this.y = 0;
        this.angle = Math.PI / 2;
        this.currentPath.moveTo(this.originX + this.x, this.originY - this.y);
        this.draw();
    }


    setwidth(width) {
        this.width = width;
    }

    arc(angle, radius) {
        const startAngle = -this.angle;
        const endAngle = -(this.angle + (angle * Math.PI) / 180);
        
        if (this.penDown) {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.beginPath();
            this.ctx.arc(this.originX + this.x, this.originY - this.y, radius, startAngle, endAngle, angle > 0);
            this.ctx.stroke();
        }
        this.currentPath.arc(this.originX + this.x, this.originY - this.y, radius, startAngle, endAngle, angle > 0);
    }

    circle(radius) {
        if (this.penDown) {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.beginPath();
            this.ctx.arc(this.originX + this.x, this.originY - this.y, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        this.currentPath.arc(this.originX + this.x, this.originY - this.y, radius, 0, 2 * Math.PI);
    }

    rectangle(x1, y1, x2, y2) {
        let rx, ry, rw, rh;
        if (x2 === undefined) {
            rx = this.originX + this.x;
            ry = this.originY - this.y - y1;
            rw = x1;
            rh = y1;
        } else {
            const ux = Math.min(x1, x2);
            const uy = Math.max(y1, y2);
            rw = Math.abs(x2 - x1);
            rh = Math.abs(y2 - y1);
            rx = this.originX + ux;
            ry = this.originY - uy;
        }

        if (this.penDown) {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.strokeRect(rx, ry, rw, rh);
        }
        this.currentPath.rect(rx, ry, rw, rh);
    }

    ellipse(x1, y1, x2, y2) {
        let ex, ey, erx, ery, erot;
        if (x2 === undefined) {
            ex = this.originX + this.x;
            ey = this.originY - this.y;
            erx = x1 / 2;
            ery = y1 / 2;
            erot = -this.angle;
        } else {
            ex = this.originX + (x1 + x2) / 2;
            ey = this.originY - (y1 + y2) / 2;
            erx = Math.abs(x2 - x1) / 2;
            ery = Math.abs(y2 - y1) / 2;
            erot = 0;
        }

        if (this.penDown) {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.beginPath();
            this.ctx.ellipse(ex, ey, erx, ery, erot, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        this.currentPath.ellipse(ex, ey, erx, ery, erot, 0, 2 * Math.PI);
    }

    line(x1, y1, x2, y2) {
        if (this.penDown) {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.beginPath();
            this.ctx.moveTo(this.originX + x1, this.originY - y1);
            this.ctx.lineTo(this.originX + x2, this.originY - y2);
            this.ctx.stroke();
        }
        this.currentPath.moveTo(this.originX + x1, this.originY - y1);
        this.currentPath.lineTo(this.originX + x2, this.originY - y2);
    }

    write(text) {
        this.ctx.font = this.fontName;
        this.ctx.fillStyle = this.color;
        this.ctx.fillText(text, this.originX + this.x, this.originY - this.y);
    }

    font(style) {
        this.fontName = style;
    }

    updateFont() {
        this.fontName = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        this.textLineHeight = this.fontSize * 1.2;
    }

    setFontSize(size) {
        const nextSize = Number(size);
        if (Number.isFinite(nextSize) && nextSize > 0) {
            this.fontSize = nextSize;
            this.updateFont();
        }
    }

    setFontStyle(style) {
        const normalized = String(style).trim().toLowerCase();
        this.fontWeight = normalized.includes('g') || normalized.includes('b') ? 'bold' : 'normal';
        this.fontStyle = normalized.includes('i') ? 'italic' : 'normal';
        this.updateFont();
    }

    setFontFamily(name) {
        const cleanName = String(name).trim();
        if (cleanName) {
            this.fontFamily = cleanName.includes(' ') ? `"${cleanName}"` : cleanName;
            this.updateFont();
        }
    }

    polygon(sides, size) {
        const deg = 360 / sides;
        for (let i = 0; i < sides; i++) {
            this.fd(size);
            this.rt(deg);
        }
    }

    star(points, outerRadius, innerRadius) {
        let step = Math.PI / points;
        this.ctx.beginPath();
        for (let i = 0; i < 2 * points; i++) {
            let r = (i % 2 === 0) ? outerRadius : innerRadius;
            let currX = this.x + r * Math.cos(this.angle + i * step);
            let currY = this.y + r * Math.sin(this.angle + i * step);
            const sx = this.originX + currX;
            const sy = this.originY - currY;
            if (i === 0) {
                this.ctx.moveTo(sx, sy);
                this.currentPath.moveTo(sx, sy);
            } else {
                this.ctx.lineTo(sx, sy);
                this.currentPath.lineTo(sx, sy);
            }
        }
        this.ctx.closePath();
        this.currentPath.closePath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
    }

    stamp() {
        this.drawOnCanvas(this.ctx);
    }

    drawOnCanvas(targetCtx) {
        targetCtx.save();
        targetCtx.translate(this.originX + this.x, this.originY - this.y);
        targetCtx.rotate(-this.angle + Math.PI / 2);
        this.drawTurtleCursor(targetCtx);
        targetCtx.restore();
    }

    drawTurtleCursor(targetCtx) {
        if (this.turtleImage) {
            const size = 30;
            targetCtx.drawImage(this.turtleImage, -size/2, -size/2, size, size);
            return;
        }

        if (this.turtleStyle === 'turtle') {
            this.drawTurtleShape(targetCtx);
        } else if (this.turtleStyle === 'spaceship') {
            this.drawSpaceshipShape(targetCtx);
        } else {
            this.drawTriangleCursor(targetCtx);
        }
    }

    drawTriangleCursor(targetCtx) {
        targetCtx.beginPath();
        targetCtx.moveTo(0, -10);
        targetCtx.lineTo(7, 10);
        targetCtx.lineTo(-7, 10);
        targetCtx.closePath();
        targetCtx.fillStyle = 'green';
        targetCtx.fill();
        targetCtx.strokeStyle = 'black';
        targetCtx.lineWidth = 1;
        targetCtx.stroke();
    }

    drawTurtleShape(targetCtx) {
        targetCtx.fillStyle = '#2e8b57';
        targetCtx.strokeStyle = '#17452d';
        targetCtx.lineWidth = 1.5;
        targetCtx.beginPath();
        targetCtx.ellipse(0, 1, 9, 12, 0, 0, 2 * Math.PI);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = '#58b36c';
        targetCtx.beginPath();
        targetCtx.arc(0, -12, 5, 0, 2 * Math.PI);
        targetCtx.fill();
        targetCtx.stroke();

        [[-8, -6], [8, -6], [-8, 8], [8, 8]].forEach(([x, y]) => {
            targetCtx.beginPath();
            targetCtx.ellipse(x, y, 3, 5, x < 0 ? -0.5 : 0.5, 0, 2 * Math.PI);
            targetCtx.fill();
            targetCtx.stroke();
        });

        targetCtx.strokeStyle = 'rgba(255,255,255,0.5)';
        targetCtx.beginPath();
        targetCtx.moveTo(0, -8);
        targetCtx.lineTo(0, 9);
        targetCtx.moveTo(-6, -2);
        targetCtx.lineTo(6, -2);
        targetCtx.stroke();
    }

    drawSpaceshipShape(targetCtx) {
        targetCtx.fillStyle = '#dbeafe';
        targetCtx.strokeStyle = '#1f2937';
        targetCtx.lineWidth = 1.5;
        targetCtx.beginPath();
        targetCtx.moveTo(0, -14);
        targetCtx.lineTo(9, 11);
        targetCtx.lineTo(0, 7);
        targetCtx.lineTo(-9, 11);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = '#38bdf8';
        targetCtx.beginPath();
        targetCtx.arc(0, -4, 4, 0, 2 * Math.PI);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = '#f97316';
        targetCtx.beginPath();
        targetCtx.moveTo(-4, 10);
        targetCtx.lineTo(0, 17);
        targetCtx.lineTo(4, 10);
        targetCtx.closePath();
        targetCtx.fill();
    }

    drawImage(url, w, h) {
        const img = new Image();
        img.onload = () => {
            this.ctx.drawImage(img, this.originX + this.x - w/2, this.originY - this.y - h/2, w, h);
            this.draw();
        };
        img.src = url;
    }

    drawImageBox(url, x1, y1, x2, y2) {
        const img = new Image();
        img.onload = () => {
            const ux = Math.min(x1, x2);
            const uy = Math.max(y1, y2);
            const w = Math.abs(x2 - x1);
            const h = Math.abs(y2 - y1);
            this.ctx.drawImage(img, this.originX + ux, this.originY - uy, w, h);
            this.draw();
        };
        img.src = url;
    }

    playVideo(url, x1, y1, x2, y2) {
        this.stopVideo();
        const video = document.createElement('video');
        video.src = url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        const ux = Math.min(x1, x2);
        const uy = Math.max(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        this.activeVideo = video;

        const drawFrame = () => {
            if (this.activeVideo !== video || video.paused || video.ended) return;
            this.ctx.drawImage(video, this.originX + ux, this.originY - uy, w, h);
            this.draw();
            this.activeVideoFrame = requestAnimationFrame(drawFrame);
        };

        video.addEventListener('playing', drawFrame, { once: true });
        video.play().catch(() => {});
    }

    stopVideo() {
        if (this.activeVideoFrame) cancelAnimationFrame(this.activeVideoFrame);
        this.activeVideoFrame = null;
        if (this.activeVideo) {
            this.activeVideo.pause();
            this.activeVideo.src = "";
        }
        this.activeVideo = null;
    }

    playSound(url) {
        this.stopSound();
        const audio = new Audio(url);
        this.activeAudio = audio;
        audio.play().catch(() => {});
    }

    stopSound() {
        if (!this.activeAudio) return;
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio = null;
    }

    gradient(type, colors) {
        let grd;
        if (type === 'linear') {
            grd = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        } else {
            grd = this.ctx.createRadialGradient(this.originX + this.x, this.originY - this.y, 5, this.originX + this.x, this.originY - this.y, 100);
        }
        colors.forEach((c, i) => grd.addColorStop(i / (colors.length - 1), c));
        this.color = grd;
    }

    opacity(value) {
        this.ctx.globalAlpha = value;
    }

    setTurtleImage(url) {
        if (!url || ['default', 'turtle', 'spaceship'].includes(url)) {
            this.turtleImage = null;
            this.turtleStyle = url || 'default';
            this.draw();
            return;
        }
        this.turtleStyle = 'image';
        const img = new Image();
        img.onload = () => {
            this.turtleImage = img;
            this.draw();
        };
        img.src = url;
    }

    setxy(x, y) {
        if (this.penDown) {
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(this.originX + this.x, this.originY - this.y);
            this.ctx.lineTo(this.originX + x, this.originY - y);
            this.ctx.stroke();
            this.currentPath.lineTo(this.originX + x, this.originY - y);
        } else {
            this.currentPath.moveTo(this.originX + x, this.originY - y);
        }
        this.x = x;
        this.y = y;
        this.draw();
    }

    setheading(deg) {
        // User heading 0 is up. Math angle 90deg is up.
        this.angle = (90 - deg) * Math.PI / 180;
        this.draw();
    }

    ht() {
        this.visible = false;
        this.draw();
    }

    st() {
        this.visible = true;
        this.draw();
    }

    posx() { return this.x; }
    posy() { return this.y; }
    heading() { 
        let h = 90 - (this.angle * 180 / Math.PI);
        while (h < 0) h += 360;
        while (h >= 360) h -= 360;
        return h;
    }

    distance(x, y) {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    }

    towards(x, y) {
        const angle = Math.atan2(y - this.y, x - this.x);
        let h = 90 - (angle * 180 / Math.PI);
        while (h < 0) h += 360;
        while (h >= 360) h -= 360;
        return h;
    }

    setcolor(color) {
        this.color = color;
    }

    pencolor(c) { this.setcolor(c); }
    fillcolor(c) {
        this.fillColor = c;
        this.currentPath = new Path2D();
        this.currentPath.moveTo(this.originX + this.x, this.originY - this.y);
    }
    
    fill(color) {
        if (color) this.fillColor = color;
        this.ctx.fillStyle = this.fillColor;
        this.ctx.fill(this.currentPath);
        this.currentPath = new Path2D();
        this.currentPath.moveTo(this.originX + this.x, this.originY - this.y);
    }

    writeLine(text) {
        const value = String(text);
        const x = this.originX + this.x;
        let y = this.originY - this.y;
        const maxWidth = Math.max(40, this.canvas.width - x - 12);
        const words = value.split(/\s+/);
        const lines = [];
        let line = "";

        this.ctx.font = this.fontName;
        for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (this.ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        lines.push(line);

        this.ctx.fillStyle = typeof this.color === 'string' ? this.color : '#000000';
        for (const textLine of lines) {
            this.ctx.fillText(textLine, x, y);
            y += this.textLineHeight;
        }
        this.y -= this.textLineHeight * lines.length;
    }

    newline(lines = 1) {
        this.y -= this.textLineHeight * lines;
        this.draw();
    }

    canvascolor(c) {
        this.canvas.style.backgroundColor = c;
    }

    setPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.round(this.originX + x), Math.round(this.originY - y), 1, 1);
    }

    getPixel(x, y) {
        const data = this.ctx.getImageData(Math.round(this.originX + x), Math.round(this.originY - y), 1, 1).data;
        return `rgba(${data[0]},${data[1]},${data[2]},${data[3] / 255})`;
    }

    draw() {
        if (!this.turtleCtx) return;

        this.turtleCtx.clearRect(0, 0, this.turtleLayer.width, this.turtleLayer.height);

        if (!this.visible) return;

        this.turtleCtx.save();
        this.turtleCtx.translate(this.originX + this.x, this.originY - this.y);
        this.turtleCtx.rotate(-this.angle + Math.PI / 2);

        this.drawTurtleCursor(this.turtleCtx);

        this.turtleCtx.restore();
    }

    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.commandQueue.length > 0) {
            const cmd = this.commandQueue.shift();
            if (cmd.type === 'fd') {
                await this.animateFd(cmd.dist);
            } else if (cmd.type === 'rt') {
                await this.animateRotate(cmd.deg);
            } else if (cmd.type === 'lt') {
                await this.animateRotate(-cmd.deg);
            }
        }

        this.isProcessing = false;
    }

    animateFd(dist) {
        return new Promise(resolve => {
            if (!this.isProcessing) return resolve();
            const steps = Math.max(1, Math.abs(dist) / (this.speed / 60));
            const stepX = (dist * Math.cos(this.angle)) / steps;
            const stepY = (dist * Math.sin(this.angle)) / steps;
            let currentStep = 0;

            const animate = () => {
                if (!this.isProcessing) return resolve();
                if (currentStep < steps) {
                    const nextX = this.x + stepX;
                    const nextY = this.y + stepY;
                    if (this.penDown) {
                        this.ctx.strokeStyle = this.color;
                        this.ctx.lineWidth = this.width;
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.originX + this.x, this.originY - this.y);
                        this.ctx.lineTo(this.originX + nextX, this.originY - nextY);
                        this.ctx.stroke();
                        this.currentPath.lineTo(this.originX + nextX, this.originY - nextY);
                    } else {
                        this.currentPath.moveTo(this.originX + nextX, this.originY - nextY);
                    }
                    this.x = nextX;
                    this.y = nextY;
                    this.draw();
                    currentStep++;
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    animateRotate(deg) {
        return new Promise(resolve => {
            if (!this.isProcessing) return resolve();
            // rt is clockwise, so if Y is up, it decreases math angle.
            // But deg passed to animateRotate is signed. 
            // If rt(90) called, animateRotate(-90) should be called? 
            // Wait, processQueue calls animateRotate(cmd.deg) for rt, and animateRotate(-cmd.deg) for lt.
            // So if rt(90), deg=90. Math angle should decrease by 90.
            const rad = -(deg * Math.PI) / 180;
            const steps = Math.max(1, Math.abs(deg) / 5);
            const stepRad = rad / steps;
            let currentStep = 0;

            const animate = () => {
                if (!this.isProcessing) return resolve();
                if (currentStep < steps) {
                    this.angle += stepRad;
                    this.draw();
                    currentStep++;
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    smooth(active) {
        this.isDrawingSmooth = active !== false;
    }

    stop() {
        this.isProcessing = false;
        this.commandQueue = [];
    }

    // Alias for common Logo commands
    forward(dist) { this.fd(dist); }
    back(dist) { this.bk(dist); }
    right(deg) { this.rt(deg); }
    left(deg) { this.lt(deg); }
    penup() { this.pu(); }
    pendown() { this.pd(); }
    clearscreen() { this.cs(); }
}

if (typeof module !== 'undefined') {
    module.exports = Turtle;
}
