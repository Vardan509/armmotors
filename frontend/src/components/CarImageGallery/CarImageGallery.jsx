import { useEffect, useRef, useState } from "react";

import useInterfaceText from "../../utils/interfaceText";

import "./CarImageGallery.css";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function distance(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export default function CarImageGallery({ images = [], title = "" }) {
    const { tr } = useInterfaceText();

    const list = Array.isArray(images) ? images.filter(Boolean) : [];

    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState({});
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);

    const viewportRef = useRef(null);
    const zoomRef = useRef(1);
    const positionRef = useRef({ x: 0, y: 0 });
    const pointersRef = useRef(new Map());
    const gestureRef = useRef(null);

    const currentIndex = Math.min(index, Math.max(0, list.length - 1));

    const src = list[currentIndex];
    const imageTitle = title || tr("car");

    function limitPosition(next, scale = zoomRef.current) {
        const viewport = viewportRef.current;

        if (!viewport || scale <= 1) {
            return { x: 0, y: 0 };
        }

        const maximumX = (viewport.clientWidth * (scale - 1)) / 2;

        const maximumY = (viewport.clientHeight * (scale - 1)) / 2;

        return {
            x: clamp(next.x, -maximumX, maximumX),
            y: clamp(next.y, -maximumY, maximumY),
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
        if (list.length < 2) return;

        changeImage((currentIndex + list.length - 1) % list.length);
    }

    function nextImage() {
        if (list.length < 2) return;

        changeImage((currentIndex + 1) % list.length);
    }

    function imageFailed(image) {
        setFailed((current) => ({
            ...current,
            [image]: true,
        }));
    }

    useEffect(() => {
        const viewport = viewportRef.current;

        if (!viewport) return;

        function wheel(event) {
            if (!src || failed[src]) return;

            event.preventDefault();

            updateZoom(
                zoomRef.current + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP),
            );
        }

        viewport.addEventListener("wheel", wheel, {
            passive: false,
        });

        return () => {
            viewport.removeEventListener("wheel", wheel);
        };
    });

    useEffect(() => {
        function keyboard(event) {
            if (
                event.target instanceof HTMLElement &&
                (["INPUT", "TEXTAREA", "SELECT"].includes(
                    event.target.tagName,
                ) ||
                    event.target.isContentEditable)
            ) {
                return;
            }

            if (
                !viewportRef.current
                    ?.closest(".car-gallery")
                    ?.contains(document.activeElement)
            ) {
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                previousImage();
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                nextImage();
            }

            if (event.key === "Escape") {
                resetZoom();
            }
        }

        window.addEventListener("keydown", keyboard);

        return () => {
            window.removeEventListener("keydown", keyboard);
        };
    });

    function handlePointerDown(event) {
        if (!src || failed[src]) return;

        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        const viewport = viewportRef.current;

        if (!viewport) return;

        pointersRef.current.set(event.pointerId, {
            clientX: event.clientX,
            clientY: event.clientY,
        });

        if (event.pointerType === "mouse" && zoomRef.current <= 1) {
            return;
        }

        viewport.setPointerCapture(event.pointerId);

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
        if (!pointersRef.current.has(event.pointerId)) return;

        pointersRef.current.set(event.pointerId, {
            clientX: event.clientX,
            clientY: event.clientY,
        });

        const points = [...pointersRef.current.values()];
        const gesture = gestureRef.current;

        if (!gesture) return;

        if (points.length >= 2 && gesture.type === "pinch") {
            if (!gesture.distance) return;

            const nextZoom = clamp(
                gesture.zoom *
                    (distance(points[0], points[1]) / gesture.distance),
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

        /*
         * lostpointercapture-ը կարող է կրկին կանչել այս handler-ը։
         * Capture-ը բաց ենք թողնում միայն եթե դեռ առկա է։
         */
        if (
            event.type !== "lostpointercapture" &&
            viewportRef.current?.hasPointerCapture(event.pointerId)
        ) {
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

    return (
        <section
            className="car-gallery am-zoom-gallery"
            aria-label={tr("gallery")}
        >
            <div className="gallery-main am-zoom-main">
                <div
                    ref={viewportRef}
                    className={`am-zoom-viewport ${
                        zoom > 1 ? "is-zoomed" : ""
                    } ${dragging ? "is-dragging" : ""}`}
                    onDoubleClick={() => {
                        if (!src || failed[src]) return;

                        if (zoomRef.current > 1) {
                            resetZoom();
                        } else {
                            updateZoom(2);
                        }
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onLostPointerCapture={handlePointerUp}
                    tabIndex={0}
                    aria-label={tr("moveImage")}
                >
                    {src && !failed[src] ? (
                        <img
                            src={src}
                            alt={`${imageTitle} — ${tr("image", {
                                number: currentIndex + 1,
                            })}`}
                            draggable={false}
                            onError={() => imageFailed(src)}
                            style={{
                                transform:
                                    `translate3d(${position.x}px, ` +
                                    `${position.y}px, 0) scale(${zoom})`,
                            }}
                        />
                    ) : (
                        <div className="gallery-empty">
                            <p>{tr("imageUnavailable")}</p>
                        </div>
                    )}
                </div>

                {list.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="gallery-prev"
                            onClick={previousImage}
                            aria-label={tr("previousImage")}
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            className="gallery-next"
                            onClick={nextImage}
                            aria-label={tr("nextImage")}
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
                            aria-label={tr("zoomOut")}
                            title={tr("zoomOut")}
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
                            aria-label={tr("zoomIn")}
                            title={tr("zoomIn")}
                        >
                            +
                        </button>

                        <button
                            type="button"
                            onClick={resetZoom}
                            disabled={zoom === 1}
                            aria-label={tr("resetImage")}
                            title={tr("resetImage")}
                        >
                            ↺
                        </button>
                    </div>
                )}

                <span className="gallery-counter" aria-live="polite">
                    {list.length ? currentIndex + 1 : 0} / {list.length}
                </span>
            </div>

            {list.length > 0 && (
                <div className="gallery-thumbs">
                    {list.map((image, imageIndex) => (
                        <button
                            type="button"
                            key={`${image}-${imageIndex}`}
                            aria-label={tr("showImage", {
                                number: imageIndex + 1,
                            })}
                            aria-pressed={imageIndex === currentIndex}
                            onClick={() => changeImage(imageIndex)}
                        >
                            {failed[image] ? (
                                <span>
                                    {tr("image", {
                                        number: imageIndex + 1,
                                    })}
                                </span>
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
