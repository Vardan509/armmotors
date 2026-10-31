import { useEffect, useId, useRef, useState } from "react";

import useCurrency, { CURRENCIES } from "../utils/useCurrency";

import { useI18n } from "../utils/i18n";

import "./CurrencySelector.css";

const TEXTS = {
    hy: {
        label: "Արժույթ",
        choose: "Ընտրեք արժույթը",
        priceCurrency: "Ընտրեք գների արժույթը",
        updated: "Փոխարժեքը թարմացվել է՝",
        source: "Փոխարժեքների աղբյուր՝",
        locale: "hy-AM",
        currencies: {
            AMD: "Հայկական դրամ",
            USD: "ԱՄՆ դոլար",
            EUR: "Եվրո",
            RUB: "Ռուսական ռուբլի",
        },
    },

    ru: {
        label: "Валюта",
        choose: "Выберите валюту",
        priceCurrency: "Выберите валюту цен",
        updated: "Курс обновлён:",
        source: "Источник курсов:",
        locale: "ru-RU",
        currencies: {
            AMD: "Армянский драм",
            USD: "Доллар США",
            EUR: "Евро",
            RUB: "Российский рубль",
        },
    },

    en: {
        label: "Currency",
        choose: "Choose a currency",
        priceCurrency: "Choose the currency for prices",
        updated: "Exchange rate updated:",
        source: "Exchange rate source:",
        locale: "en-US",
        currencies: {
            AMD: "Armenian dram",
            USD: "US dollar",
            EUR: "Euro",
            RUB: "Russian ruble",
        },
    },
};

const SYMBOLS = {
    AMD: "֏",
    USD: "$",
    EUR: "€",
    RUB: "₽",
};

export default function CurrencySelect() {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const { currency, setCurrency, updatedAt } = useCurrency();

    const [isOpen, setIsOpen] = useState(false);

    const wrapperRef = useRef(null);
    const buttonRef = useRef(null);
    const optionRefs = useRef([]);

    const menuId = useId();

    const selectedName = text.currencies[currency] || currency;

    const selectedSymbol = SYMBOLS[currency] || currency;

    const selectedIndex = Math.max(0, CURRENCIES.indexOf(currency));

    const date = updatedAt ? new Date(updatedAt) : null;

    const updateTitle =
        date && !Number.isNaN(date.getTime())
            ? `${text.updated} ${date.toLocaleDateString(text.locale)}`
            : text.priceCurrency;

    useEffect(() => {
        if (!isOpen) return;

        function handleOutside(event) {
            if (!wrapperRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("pointerdown", handleOutside);

        document.addEventListener("focusin", handleOutside);

        return () => {
            document.removeEventListener("pointerdown", handleOutside);

            document.removeEventListener("focusin", handleOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            optionRefs.current[selectedIndex]?.focus();
        }
    }, [isOpen, selectedIndex]);

    function closeMenu() {
        setIsOpen(false);
        buttonRef.current?.focus();
    }

    function selectCurrency(code) {
        setCurrency(code);
        closeMenu();
    }

    function handleOptionKeyDown(event, index) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
            return;
        }

        let nextIndex;

        if (event.key === "ArrowDown") {
            nextIndex = (index + 1) % CURRENCIES.length;
        } else if (event.key === "ArrowUp") {
            nextIndex = (index - 1 + CURRENCIES.length) % CURRENCIES.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = CURRENCIES.length - 1;
        }

        if (nextIndex !== undefined) {
            event.preventDefault();
            optionRefs.current[nextIndex]?.focus();
        }
    }

    return (
        <div className="currency-control" title={updateTitle}>
            <div className="currency-selector" ref={wrapperRef}>
                <span className="currency-label">{text.label}</span>

                <button
                    ref={buttonRef}
                    type="button"
                    className={`currency-button ${isOpen ? "is-open" : ""}`}
                    aria-label={`${text.label}: ${selectedName}`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? menuId : undefined}
                    onClick={() => {
                        setIsOpen((previous) => !previous);
                    }}
                    onKeyDown={(event) => {
                        if (
                            event.key === "ArrowDown" ||
                            event.key === "ArrowUp"
                        ) {
                            event.preventDefault();
                            setIsOpen(true);
                        } else if (event.key === "Escape") {
                            closeMenu();
                        }
                    }}
                >
                    <span className="currency-symbol" aria-hidden="true">
                        {selectedSymbol}
                    </span>

                    <span className="currency-code">{currency}</span>

                    <svg
                        className="currency-chevron"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="m6 9 6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {isOpen && (
                    <div
                        id={menuId}
                        className="currency-menu"
                        role="menu"
                        aria-label={text.choose}
                    >
                        <div
                            className="currency-menu-heading"
                            role="presentation"
                        >
                            {text.choose}
                        </div>

                        {CURRENCIES.map((code, index) => {
                            const isSelected = currency === code;

                            const name = text.currencies[code] || code;

                            const symbol = SYMBOLS[code] || code;

                            return (
                                <button
                                    key={code}
                                    ref={(element) => {
                                        optionRefs.current[index] = element;
                                    }}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={isSelected}
                                    tabIndex={-1}
                                    className={`currency-option ${
                                        isSelected ? "is-selected" : ""
                                    }`}
                                    onClick={() => {
                                        selectCurrency(code);
                                    }}
                                    onKeyDown={(event) => {
                                        handleOptionKeyDown(event, index);
                                    }}
                                >
                                    <span
                                        className="currency-option-symbol"
                                        aria-hidden="true"
                                    >
                                        {symbol}
                                    </span>

                                    <span className="currency-option-info">
                                        <strong>{code}</strong>

                                        <span>{name}</span>
                                    </span>

                                    {isSelected && (
                                        <svg
                                            className="currency-check"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="m5 12 4 4L19 6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}

                        <a
                            className="rates-source"
                            href="https://www.exchangerate-api.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {text.source} ExchangeRate-API
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
