export class Product {
    constructor(data) {
        this.name = data.name.toLowerCase();
        this.price = typeof data.price == 'number' ? data.price : Number(data.price);
        this.stock = typeof data.stock == 'number' ? data.stock : Number(data.stock);
        this.discount = typeof data.discount == 'number' ? data.discount : Number(data.discount);
        this.summary = data.summary;
        this.imageName = data.imageName;
        this.imageURL = data.imageURL;
        this.qty = Number.isInteger(data.qty) ? data.qty : null;
    }

    //Next, we define serialize to convert product to a form compatible with firestore datatype
    serialize() {
        return {
            name: this.name,
            price: this.price,
            stock: this.stock,
            discount: this.discount,
            summary: this.summary,
            imageName: this.imageName,
            imageURL: this.imageURL,
            qty: this.qty,
        };
    }

    static isSerializedProduct(p) {
        if (!p.name) return false;
        if (!p.price || typeof p.price != 'number') return false;
        if (!p.stock || typeof p.stock != 'number') return false;
        if (!p.discount || typeof p.discount != 'number') return false;
        if (!p.summary) return false;
        if (!p.imageName) return false;
        if (!p.imageURL || !p.imageURL.includes('https')) return false;
        if (!p.qty || !Number.isInteger(p.qty)) return false;

        return true;
    }

    serializeForUpdate() {
        const p = {};
        if (this.name) {
            p.name = this.name;
        }
        if (this.price) {
            p.price = this.price;
        }
        if (this.stock) {
            p.stock = this.stock;
        }
        if (this.discount) {
            p.discount = this.discount;
        }
        if (this.summary) {
            p.summary = this.summary;
        }
        if (this.imageName) {
            p.imageName = this.imageName;
        }
        if (this.imageURL) {
            p.imageURL = this.imageURL;
        }

        return p;
    }

    validate(imageFile) {
        const errors = {};
        if (!this.name || this.name.length < 2)
            errors.name = 'Product name too short; min 3 chars expected';
        if (!this.price || !Number(this.price))
            errors.price = 'Price is not a number';
        if (!this.stock || !Number(this.stock))
            errors.stock = 'Stock is not a number';
        if (!this.summary || this.summary.length < 5)
            errors.summary = 'Product summary too short; min 5 chars';
        if (!imageFile)
            errors.image = 'Image not selected';

        return errors;
    }
}