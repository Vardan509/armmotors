import { useSyncExternalStore } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../../utils/i18n";
import useProducts from "../../utils/useProducts";
import useCurrency from "../../utils/useCurrency";
import {
    getCompareIds,
    removeCompare,
    clearCompare,
    subscribeCompare,
} from "../../utils/compare";
import "./CompareTray.css";

const LABELS = {
    hy: { title: "Մեքենաների համեմատություն", pick: "Ընտրեք ևս 1 կամ 2 մեքենա", ready: "Պատրաստ է համեմատության", next: "Ընտրել հաջորդ մեքենան", view: "Տեսնել համեմատությունը", clear: "Մաքրել", remove: "Հեռացնել", car: "Մեքենա", selected: "Ընտրված" },
    ru: { title: "Сравнение автомобилей", pick: "Выберите ещё 1 или 2 автомобиля", ready: "Готово к сравнению", next: "Выбрать следующий автомобиль", view: "Посмотреть сравнение", clear: "Очистить", remove: "Удалить", car: "Автомобиль", selected: "Выбрано" },
    en: { title: "Car comparison", pick: "Choose 1 or 2 more cars", ready: "Ready to compare", next: "Choose another car", view: "View comparison", clear: "Clear", remove: "Remove", car: "Car", selected: "Selected" },
};

export default function CompareTray() {
    const { language } = useI18n();
    const { pathname } = useLocation();
    const { products = [] } = useProducts();
    const { format } = useCurrency();
    const text = LABELS[language] || LABELS.hy;

    const snapshot = useSyncExternalStore(
        subscribeCompare,
        () => JSON.stringify(getCompareIds()),
        () => "[]",
    );
    const ids = JSON.parse(snapshot);
    const count = ids.length;
    const productList = Array.isArray(products) ? products : [];

    if (!count || pathname === "/compare") return null;

    return (
        <aside className="am-compare-tray" aria-label={text.title}>
            <div className="am-compare-tray-heading">
                <div>
                    <span className="am-compare-label">ARMMOTORS</span>
                    <h2>{text.title}</h2>
                    <p>{count < 2 ? text.pick : text.ready}</p>
                </div>
                <button className="am-compare-clear" type="button" onClick={clearCompare}>{text.clear}</button>
            </div>
            <div className="am-compare-items">
                {ids.map((id, index) => {
                    const product = productList.find((p) => String(p._id || p.id) === id);
                    const title = product?.title || [product?.brand, product?.model].filter(Boolean).join(" ") || `${text.car} ${index + 1}`;
                    const image = product?.image || product?.images?.[0];
                    return (
                        <div className="am-compare-item" key={id}>
                            {image ? <img className="am-compare-thumbnail" src={image} alt={title} /> : <span className="am-compare-number">{index + 1}</span>}
                            <div className="am-compare-item-details">
                                <strong title={title}>{title}</strong>
                                {product?.price != null && <span>{format(product.price, product.currency || "AMD")}</span>}
                            </div>
                            <button type="button" onClick={() => removeCompare(id)} aria-label={`${text.remove}: ${title}`} title={text.remove}>×</button>
                        </div>
                    );
                })}
            </div>
            <div className="am-compare-actions">
                <span className="am-compare-counter">{text.selected}: {count}/3</span>
                {count < 3 && <Link to="/cars" className="am-compare-next">+ {text.next}</Link>}
                {count >= 2 && <Link to="/compare" className="am-compare-view">{text.view} →</Link>}
            </div>
        </aside>
    );
}
