
import mongoose from "mongoose";

function carRequired() {
    return this.type === "car";
}

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

        status: {
            type: String,
            enum: ["active", "draft", "sold"],
            default: "active",
            index: true,
        },

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

        fuel: {
            type: String,
            enum: [
                "petrol",
                "diesel",
                "gas",
                "hybrid",
                "electric",
            ],
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

        region: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60,
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
                    /^\+?[0-9]{8,15}$/.test(
                        value.replace(/[\s()-]/g, "")
                    ),
                message: "Հեռախոսահամարը սխալ է։",
            },
        },

        images: {
            type: [String],
            default: [],
            validate: {
                validator: (images) =>
                    images.length <= 12 &&
                    images.every((image) =>
                        /^https?:\/\//i.test(image)
                    ),
                message:
                    "Ավելացրեք առավելագույնը 12 նկարի HTTP/HTTPS հղում։",
            },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Product", productSchema);
