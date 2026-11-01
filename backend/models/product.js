import mongoose from "mongoose";

function carRequired() {
    return this.type === "car";
}

const COMFORT_OPTIONS = [
    "airConditioning",
    "climateControl",
    "heatedSeats",
    "ventilatedSeats",
    "heatedSteering",
    "heatedWindshield",
    "cruiseControl",
    "adaptiveCruise",
    "parkingSensors",
    "rearCamera",
    "camera360",
    "keylessEntry",
    "startStop",
    "electricSeats",
    "memorySeats",
    "navigation",
    "bluetooth",
    "appleCarplay",
    "androidAuto",
];

const productSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["car", "part"],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 120,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            enum: ["AMD", "USD", "RUB"],
            default: "AMD",
            uppercase: true,
        },

        topUntil: {
            type: Date,
            default: null,
            index: true,
        },

        lastRefreshedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },

        autoRefreshUntil: {
            type: Date,
            default: null,
        },

        paymentPending: {
            type: Boolean,
            default: false,
        },

        views: {
            type: Number,
            default: 0,
            min: 0,
        },

        status: {
            type: String,
            enum: ["active", "draft", "sold"],
            default: "active",
            index: true,
        },

        /* Մեքենայի հիմնական տվյալներ */

        vehicleType: {
            type: String,
            enum: ["passenger", "truck"],
            required: carRequired,
        },

        brand: {
            type: String,
            trim: true,
            required: carRequired,
            maxlength: 60,
        },

        model: {
            type: String,
            trim: true,
            required: carRequired,
            maxlength: 60,
        },

        year: {
            type: Number,
            required: carRequired,
            min: 1886,
            validate: {
                validator: (value) =>
                    Number.isInteger(value) &&
                    value <= new Date().getFullYear() + 1,
                message: "Տարեթիվը սխալ է։",
            },
        },

        mileage: {
            type: Number,
            required: carRequired,
            min: 0,
        },

        /*
         * Շարժիչի ծավալը՝ լիտրերով։
         * Օրինակ՝ 1.6, 2.0, 3.5։
         * Հին հայտարարությունների համար կարող է մնալ null։
         */

        engineVolume: {
            type: Number,
            default: null,
            min: 0.1,
            max: 30,
            validate: {
                validator: (value) => value == null || Number.isFinite(value),
                message: "Շարժիչի ծավալը սխալ է։",
            },
        },

        fuel: {
            type: String,
            enum: ["petrol", "diesel", "gas", "hybrid", "electric"],
            required: carRequired,
        },

        steering: {
            type: String,
            enum: ["left", "right"],
            required: carRequired,
        },

        color: {
            type: String,
            trim: true,
            maxlength: 40,
        },

        vin: {
            type: String,
            trim: true,
            maxlength: 17,
        },

        condition: {
            type: String,
            enum: ["Նոր", "Օգտագործված"],
            default: "Օգտագործված",
        },

        /* Գտնվելու վայր */

        region: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60,
        },

        community: {
            type: String,
            trim: true,
            default: "",
            maxlength: 100,
        },

        settlement: {
            type: String,
            trim: true,
            default: "",
            maxlength: 100,
        },

        /* Լրացուցիչ տեխնիկական տվյալներ */

        customsCleared: {
            type: String,
            enum: ["", "yes", "no"],
            default: "",
        },

        paintCondition: {
            type: String,
            enum: ["", "original", "repainted"],
            default: "",
        },

        gasEquipment: {
            type: String,
            enum: ["", "installed", "notInstalled"],
            default: "",
        },

        gasCylinderReplaced: {
            type: String,
            enum: ["", "yes", "no"],
            default: "",
        },

        wheelSize: {
            type: String,
            enum: [
                "",
                "R13",
                "R14",
                "R15",
                "R16",
                "R17",
                "R18",
                "R19",
                "R20",
                "R21",
                "R22",
                "R23",
                "R24",
            ],
            default: "",
        },

        /* Սրահ */

        interiorMaterial: {
            type: String,
            enum: ["", "fabric", "leather", "artificial", "alcantara", "other"],
            default: "",
        },

        sunroof: {
            type: String,
            enum: ["", "standard", "panoramic", "none"],
            default: "",
        },

        headlights: {
            type: [String],
            enum: ["halogen", "xenon", "led"],
            default: [],
        },

        comfort: {
            type: [String],
            enum: COMFORT_OPTIONS,
            default: [],
        },

        /* Հայտարարության տվյալներ */

        description: {
            type: String,
            trim: true,
            maxlength: 7000,
        },

        phone: {
            type: String,
            required: true,
            validate: {
                validator: (value) =>
                    /^\+?[0-9]{8,15}$/.test(value.replace(/[\s()-]/g, "")),
                message: "Հեռախոսահամարը սխալ է։",
            },
        },

        images: {
            type: [String],
            default: [],
            validate: {
                validator: (images) =>
                    images.length <= 12 &&
                    images.every((image) => /^https?:\/\//i.test(image)),
                message: "Ավելացրեք առավելագույնը 12 նկարի HTTP/HTTPS հղում։",
            },
        },
    },
    {
        timestamps: true,
    },
);

/*
 * Էլեկտրական մեքենայի կամ պահեստամասի համար
 * շարժիչի ծավալ չենք պահպանում։
 */

productSchema.pre("validate", function () {
    if (this.type !== "car" || this.fuel === "electric") {
        this.engineVolume = null;
    }
});

/* Ինդեքսներ */

productSchema.index({
    status: 1,
    createdAt: -1,
});

productSchema.index({
    status: 1,
    type: 1,
    createdAt: -1,
});

productSchema.index({
    status: 1,
    brand: 1,
    createdAt: -1,
});

productSchema.index({
    status: 1,
    price: 1,
});

productSchema.index({
    owner: 1,
    createdAt: -1,
});

productSchema.index({
    type: 1,
    brand: 1,
    model: 1,
});

productSchema.index({
    type: 1,
    region: 1,
    community: 1,
});

export default mongoose.model("Product", productSchema);
