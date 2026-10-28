import "./ProductSkeleton.css";

export default function ProductSkeleton({ count = 8 }) {
    return (
        <div className="product-skeleton-grid" aria-busy="true">
            {Array.from({ length: count }, (_, index) => (
                <div className="product-skeleton-card" key={index}>
                    <div className="skeleton-image skeleton-shine" />

                    <div className="skeleton-content">
                        <div className="skeleton-line skeleton-title skeleton-shine" />
                        <div className="skeleton-line skeleton-small skeleton-shine" />
                        <div className="skeleton-line skeleton-price skeleton-shine" />
                    </div>
                </div>
            ))}
        </div>
    );
}
