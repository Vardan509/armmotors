import { useEffect, useRef, useState } from "react";
import "./CarImageGallery.css";


const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function distance(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export default function CarImageGallery({ images = [], title = "Ավտոմեքենա" }) {
    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState({});
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });
    const [dragging, setDragging] = useState(false);

    const viewportRef = useRef(null);
    const zoomRef = useRef(1);
    const positionRef = useRef({ x: 0, y: 0 });
    const pointersRef = useRef(new Map());
    const gestureRef = useRef(null);

    const src = images[index];

    function limitPosition(next, scale = zoomRef.current) {
        const element = viewportRef.current;

        if (!element || scale <= 1) {
            return { x: 0, y: 0 };
        }

        const maxX = (element.clientWidth * (scale - 1)) / 2;
        const maxY = (element.clientHeight * (scale - 1)) / 2;

        return {
            x: clamp(next.x, -maxX, maxX),
            y: clamp(next.y, -maxY, maxY),
        };
    }

    function updatePosition(next, scale = zoomRef.current) {
        const limited = limitPosition(next, scale);
        positionRef.current = limited;
        setPosition(limited);
    }

    function updateZoom(nextZoom) {
        const limited = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
        zoomRef.current = limited;
        setZoom(limited);
        updatePosition(positionRef.current, limited);
    }

    function resetZoom() {
        zoomRef.current = 1;
        positionRef.current = { x: 0, y: 0 };
        pointersRef.current.clear();
        gestureRef.current = null;

        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setDragging(false);
    }

    function changeImage(nextIndex) {
        resetZoom();
        setIndex(nextIndex);
    }

    function previousImage() {
        if (images.length < 2) return;

        changeImage((index + images.length - 1) % images.length);
    }

    function nextImage() {
        if (images.length < 2) return;

        changeImage((index + 1) % images.length);
    }

    function imageFailed(image) {
        setFailed((previous) => ({
            ...previous,
            [image]: true,
        }));
    }

    function handleWheel(event) {
        if (!src || failed[src]) return;

        event.preventDefault();

        const direction = event.deltaY < 0 ? 1 : -1;
        updateZoom(zoomRef.current + direction * ZOOM_STEP);
    }

    useEffect(() => {
        const element = viewportRef.current;
        if (!element) return;

        element.addEventListener("wheel", handleWheel, {
            passive: false,
        });

        return () => {
            element.removeEventListener("wheel", handleWheel);
        };
    });

    useEffect(() => {
        function handleKey(event) {
            if (
                event.target instanceof HTMLElement &&
                ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
            ) {
                return;
            }

            if (!viewportRef.current?.contains(document.activeElement)) {
                return;
            }

            if (event.key === "ArrowLeft") {
                previousImage();
            }

            if (event.key === "ArrowRight") {
                nextImage();
            }

            if (event.key === "Escape") {
                resetZoom();
            }
        }

        window.addEventListener("keydown", handleKey);

        return () => {
            window.removeEventListener("keydown", handleKey);
        };
    });

    function handlePointerDown(event) {
        if (!src || failed[src]) return;

        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        const element = viewportRef.current;
        if (!element) return;

        pointersRef.current.set(event.pointerId, {
            clientX: event.clientX,
            clientY: event.clientY,
        });

        if (event.pointerType === "mouse" && zoomRef.current <= 1) {
            return;
        }

        element.setPointerCapture(event.pointerId);

        const points = [...pointersRef.current.values()];

        if (points.length >= 2) {
            gestureRef.current = {
                type: "pinch",
                distance: distance(points[0], points[1]),
                zoom: zoomRef.current,
                position: { ...positionRef.current },
                center: {
                    x: (points[0].clientX + points[1].clientX) / 2,
                    y: (points[0].clientY + points[1].clientY) / 2,
                },
            };
        } else if (zoomRef.current > 1) {
            gestureRef.current = {
                type: "drag",
                x: event.clientX,
                y: event.clientY,
                position: { ...positionRef.current },
            };
            setDragging(true);
        }
    }

    function handlePointerMove(event) {
        if (!pointersRef.current.has(event.pointerId)) {
            return;
        }

        pointersRef.current.set(event.pointerId, {
            clientX: event.clientX,
            clientY: event.clientY,
        });

        const points = [...pointersRef.current.values()];
        const gesture = gestureRef.current;

        if (!gesture) return;

        if (points.length >= 2 && gesture.type === "pinch") {
            const currentDistance = distance(points[0], points[1]);

            if (!gesture.distance) return;

            const nextZoom = clamp(
                gesture.zoom * (currentDistance / gesture.distance),
                MIN_ZOOM,
                MAX_ZOOM,
            );

            updateZoom(nextZoom);

            const center = {
                x: (points[0].clientX + points[1].clientX) / 2,
                y: (points[0].clientY + points[1].clientY) / 2,
            };

            updatePosition(
                {
                    x: gesture.position.x + center.x - gesture.center.x,
                    y: gesture.position.y + center.y - gesture.center.y,
                },
                nextZoom,
            );

            return;
        }

        if (
            points.length === 1 &&
            gesture.type === "drag" &&
            zoomRef.current > 1
        ) {
            updatePosition({
                x: gesture.position.x + event.clientX - gesture.x,
                y: gesture.position.y + event.clientY - gesture.y,
            });
        }
    }

    function handlePointerUp(event) {
        pointersRef.current.delete(event.pointerId);

        if (viewportRef.current?.hasPointerCapture(event.pointerId)) {
            viewportRef.current.releasePointerCapture(event.pointerId);
        }

        gestureRef.current = null;
        setDragging(false);

        const remaining = [...pointersRef.current.values()];

        if (remaining.length === 1 && zoomRef.current > 1) {
            gestureRef.current = {
                type: "drag",
                x: remaining[0].clientX,
                y: remaining[0].clientY,
                position: { ...positionRef.current },
            };
        }
    }

    function handleDoubleClick() {
        if (zoomRef.current > 1) {
            resetZoom();
        } else {
            updateZoom(2);
        }
    }

    return (
        <section
            className="car-gallery am-zoom-gallery"
            aria-label="Հայտարարության նկարներ"
        >
            <div className="gallery-main am-zoom-main">
                <div
                    ref={viewportRef}
                    className={`am-zoom-viewport ${
                        zoom > 1 ? "is-zoomed" : ""
                    } ${dragging ? "is-dragging" : ""}`}
                    onDoubleClick={handleDoubleClick}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onLostPointerCapture={handlePointerUp}
                    tabIndex={0}
                    aria-label="Մեծացնել կամ տեղափոխել նկարը"
                >
                    {src && !failed[src] ? (
                        <img
                            src={src}
                            alt={`${title} — նկար ${index + 1}`}
                            draggable={false}
                            onError={() => imageFailed(src)}
                            style={{
                                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                            }}
                        />
                    ) : (
                        <div className="gallery-empty">
                            <p>Նկարը հասանելի չէ</p>
                        </div>
                    )}
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="gallery-prev"
                            onClick={previousImage}
                            aria-label="Նախորդ նկար"
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            className="gallery-next"
                            onClick={nextImage}
                            aria-label="Հաջորդ նկար"
                        >
                            ›
                        </button>
                    </>
                )}

                {src && !failed[src] && (
                    <div className="am-zoom-controls">
                        <button
                            type="button"
                            onClick={() =>
                                updateZoom(zoomRef.current - ZOOM_STEP)
                            }
                            disabled={zoom <= MIN_ZOOM}
                            aria-label="Փոքրացնել նկարը"
                            title="Փոքրացնել"
                        >
                            −
                        </button>

                        <span>{Math.round(zoom * 100)}%</span>

                        <button
                            type="button"
                            onClick={() =>
                                updateZoom(zoomRef.current + ZOOM_STEP)
                            }
                            disabled={zoom >= MAX_ZOOM}
                            aria-label="Մեծացնել նկարը"
                            title="Մեծացնել"
                        >
                            +
                        </button>

                        <button
                            type="button"
                            onClick={resetZoom}
                            disabled={zoom === 1}
                            aria-label="Վերականգնել նկարը"
                            title="Վերականգնել"
                        >
                            ↺
                        </button>
                    </div>
                )}

                <span className="gallery-counter" aria-live="polite">
                    {images.length ? index + 1 : 0} / {images.length}
                </span>
            </div>

            {images.length > 0 && (
                <div className="gallery-thumbs">
                    {images.map((image, i) => (
                        <button
                            type="button"
                            key={`${image}-${i}`}
                            aria-label={`Ցուցադրել նկար ${i + 1}`}
                            aria-pressed={i === index}
                            onClick={() => changeImage(i)}
                        >
                            {failed[image] ? (
                                <span>Նկար {i + 1}</span>
                            ) : (
                                <img
                                    src={image}
                                    alt=""
                                    loading="lazy"
                                    onError={() => imageFailed(image)}
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
