import { useState } from "react";
import { Link } from "react-router-dom";

import AccountPageContent from "./AccountPageContent";
import useRemote from "../utils/useRemote";
import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";

import "./AccountV3.css";

const TEXTS = {
    hy: {
        account: "Իմ հաշիվը",
        edit: "Խմբագրել",
        name: "Անուն",
        surname: "Ազգանուն",
        phone: "Հեռախոսահամար",
        email: "Էլ․ փոստ",
        save: "Պահպանել",
        cancel: "Չեղարկել",
        saving: "Պահպանվում է…",
        saved: "Տվյալները պահպանված են։",
        favorites: "Հավանածներ",
        messages: "Նամակներ",
        missingPhone: "Ավելացնել հեռախոսահամար",
        code: "Հաստատման կոդ",
        codeSent: "Կոդն ուղարկել ենք նոր էլ․ փոստին։ Գործում է 10 րոպե։",
        confirm: "Հաստատել էլ․ փոստը",
        error: "Չհաջողվեց։ Կրկին փորձեք։",
        total: "Ընդհանուր",
        active: "Ակտիվ",
        sold: "Վաճառված",
        views: "Դիտումներ",
        listings: "Իմ հայտարարությունները",
    },
    ru: {
        account: "Мой аккаунт",
        edit: "Изменить",
        name: "Имя",
        surname: "Фамилия",
        phone: "Телефон",
        email: "Эл. почта",
        save: "Сохранить",
        cancel: "Отмена",
        saving: "Сохранение…",
        saved: "Данные сохранены.",
        favorites: "Избранное",
        messages: "Сообщения",
        missingPhone: "Добавить телефон",
        code: "Код подтверждения",
        codeSent: "Код отправлен на новую почту. Действует 10 минут.",
        confirm: "Подтвердить почту",
        error: "Не удалось. Попробуйте ещё раз.",
        total: "Всего",
        active: "Активные",
        sold: "Проданные",
        views: "Просмотры",
        listings: "Мои объявления",
    },
    en: {
        account: "My account",
        edit: "Edit",
        name: "First name",
        surname: "Last name",
        phone: "Phone",
        email: "Email",
        save: "Save",
        cancel: "Cancel",
        saving: "Saving…",
        saved: "Details saved.",
        favorites: "Favorites",
        messages: "Messages",
        missingPhone: "Add phone number",
        code: "Verification code",
        codeSent: "Code sent to your new email. Valid for 10 minutes.",
        confirm: "Confirm email",
        error: "Could not save. Please try again.",
        total: "Total",
        active: "Active",
        sold: "Sold",
        views: "Views",
        listings: "My listings",
    },
};

function Icon({ name, size = 20 }) {
    const paths = {
        edit: <path d="m4 16 11-11 4 4-11 11-5 1zM13 7l4 4" />,
        mail: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 7 9-7" />
            </>
        ),
        phone: (
            <path d="M6 3h4l1 5-2 2a16 16 0 0 0 5 5l2-2 5 1v4c0 2-2 3-4 3C9 21 3 15 3 7c0-2 1-4 3-4Z" />
        ),
        heart: (
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
        ),
        message: <path d="M4 4h16v12H9l-5 4V4Zm4 4h8M8 12h5" />,
        arrow: <path d="m9 6 6 6-6 6" />,
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}

function Profile({ text, onRefresh }) {
    const [revision, setRevision] = useState(0);
    const remote = useRemote("/auth/profile", revision);

    const [updatedUser, setUpdatedUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: "",
        surname: "",
        phone: "",
        email: "",
    });

    const [code, setCode] = useState("");
    const [awaitingCode, setAwaitingCode] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const user = updatedUser || remote.data?.user || remote.data;

    if (remote.loading && !user) return null;

    if (remote.error && !user) {
        return (
            <div className="av3-profile">
                <p role="alert">{remote.error}</p>
                <button
                    type="button"
                    className="av3-edit"
                    onClick={() => setRevision((value) => value + 1)}
                >
                    ↻
                </button>
            </div>
        );
    }

    if (!user) return null;

    const fullName = [user.name, user.surname].filter(Boolean).join(" ");

    const initials = [user.name, user.surname]
        .filter(Boolean)
        .map((value) => Array.from(value)[0])
        .join("")
        .toUpperCase();

    function startEditing() {
        setForm({
            name: user.name || "",
            surname: user.surname || "",
            phone: user.phone || "",
            email: user.email || "",
        });

        setCode("");
        setAwaitingCode(false);
        setError("");
        setSuccess("");
        setEditing(true);
    }

    function updateField(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    }

    function applyUser(nextUser) {
        setUpdatedUser(nextUser);
        setRevision((value) => value + 1);
        onRefresh();
        window.dispatchEvent(new Event("session-changed"));
    }

    async function saveProfile(event) {
        event.preventDefault();

        if (busy) return;

        setBusy(true);
        setError("");
        setSuccess("");

        try {
            const result = await apiRequest("/auth/profile", {
                method: "PATCH",
                body: JSON.stringify({
                    name: form.name,
                    surname: form.surname,
                    phone: form.phone,
                }),
            });

            applyUser(result.user);

            const emailChanged =
                form.email.trim().toLowerCase() !==
                String(result.user.email).toLowerCase();

            if (emailChanged) {
                await apiRequest("/auth/profile/email-request", {
                    method: "POST",
                    body: JSON.stringify({
                        email: form.email.trim(),
                    }),
                });

                setAwaitingCode(true);
                setCode("");
            } else {
                setEditing(false);
                setSuccess(text.saved);
            }
        } catch (requestError) {
            setError(requestError.message || text.error);
        } finally {
            setBusy(false);
        }
    }

    async function confirmEmail(event) {
        event.preventDefault();

        if (busy) return;

        setBusy(true);
        setError("");

        try {
            const result = await apiRequest("/auth/profile/email-confirm", {
                method: "POST",
                body: JSON.stringify({ code }),
            });

            applyUser(result.user);
            setAwaitingCode(false);
            setEditing(false);
            setSuccess(text.saved);
        } catch (requestError) {
            setError(requestError.message || text.error);
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <section className="av3-profile">
                <div className="av3-profile-top">
                    <div className="av3-avatar" aria-hidden="true">
                        {initials || "A"}
                    </div>

                    <h2>{fullName}</h2>

                    <button
                        type="button"
                        className="av3-edit"
                        onClick={startEditing}
                        aria-label={text.edit}
                        title={text.edit}
                        disabled={busy}
                    >
                        <Icon name="edit" />
                    </button>
                </div>

                <div className="av3-contact">
                    <Icon name="mail" size={18} />
                    <span>{user.email}</span>
                </div>

                <div className="av3-contact">
                    <Icon name="phone" size={18} />

                    {user.phone ? (
                        <span>{user.phone}</span>
                    ) : (
                        <button type="button" onClick={startEditing}>
                            {text.missingPhone}
                        </button>
                    )}
                </div>
            </section>

            {editing && (
                <section className="av3-editor">
                    <h2>{text.edit}</h2>

                    {awaitingCode ? (
                        <form onSubmit={confirmEmail}>
                            <p className="av3-hint">{text.codeSent}</p>

                            <strong className="av3-new-email">
                                {form.email}
                            </strong>

                            <label>
                                <span>{text.code}</span>

                                <input
                                    value={code}
                                    onChange={(event) =>
                                        setCode(
                                            event.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6),
                                        )
                                    }
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    required
                                    disabled={busy}
                                />
                            </label>

                            {error && (
                                <p className="av3-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <div className="av3-form-actions">
                                <button type="submit" disabled={busy}>
                                    {busy ? text.saving : text.confirm}
                                </button>

                                <button
                                    type="button"
                                    className="av3-cancel"
                                    disabled={busy}
                                    onClick={() => {
                                        setEditing(false);
                                        setAwaitingCode(false);
                                    }}
                                >
                                    {text.cancel}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={saveProfile}>
                            <div className="av3-name-grid">
                                <label>
                                    <span>{text.name}</span>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={updateField}
                                        maxLength={60}
                                        autoComplete="given-name"
                                        required
                                        disabled={busy}
                                    />
                                </label>

                                <label>
                                    <span>{text.surname}</span>
                                    <input
                                        name="surname"
                                        value={form.surname}
                                        onChange={updateField}
                                        maxLength={60}
                                        autoComplete="family-name"
                                        disabled={busy}
                                    />
                                </label>
                            </div>

                            <label>
                                <span>{text.phone}</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={updateField}
                                    autoComplete="tel"
                                    placeholder="+374 99 123456"
                                    required
                                    disabled={busy}
                                />
                            </label>

                            <label>
                                <span>{text.email}</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={updateField}
                                    autoComplete="email"
                                    maxLength={254}
                                    required
                                    disabled={busy}
                                />
                            </label>

                            {error && (
                                <p className="av3-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <div className="av3-form-actions">
                                <button type="submit" disabled={busy}>
                                    {busy ? text.saving : text.save}
                                </button>

                                <button
                                    type="button"
                                    className="av3-cancel"
                                    disabled={busy}
                                    onClick={() => setEditing(false)}
                                >
                                    {text.cancel}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            )}

            {success && (
                <p className="av3-success" role="status">
                    {success}
                </p>
            )}

            <div className="av3-shortcuts">
                <Link to="/favorites">
                    <Icon name="heart" />
                    <span>{text.favorites}</span>
                    <Icon name="arrow" size={15} />
                </Link>

                <Link to="/messages">
                    <Icon name="message" />
                    <span>{text.messages}</span>
                    <Icon name="arrow" size={15} />
                </Link>
            </div>
        </>
    );
}

export default function AccountPage() {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;
    const [revision, setRevision] = useState(0);

    return (
        <div className="account-page-v3">
            <div className="av3-top">
                <h1>{text.account}</h1>

                <Profile
                    text={text}
                    onRefresh={() => setRevision((value) => value + 1)}
                />
            </div>

            <AccountPageContent key={revision} />
        </div>
    );
}
