export class Review {
    constructor(data) {
        this.stars = data.starRating;
        this.comment = data.comment;
        this.product = data.product;
        this.author = data.author;
        this.timestamp = data.timestamp;
    }

    // Next, we define serialize to convert product to a 
    // form compatible with firestore datatype
    serialize() {
        return {
            stars: this.stars,
            comment: this.comment,
            product: this.product,
            author: this.author,
            timestamp: this.timestamp,
        };
    }

    static isSerializedComment(p) {
        if (!p.stars) return false;
        if (!p.comment) return false;
        if (!p.product) return false;
        if (!p.author) return false;

        return true;
    }

    serializeForUpdate() {
        const p = {};
        if (this.stars) {
            p.stars = this.stars;
        }
        if (this.comment) {
            p.comment = this.comment;
        }
        if (this.product) {
            p.product = this.product;
        }
        if (this.author) {
            p.author = this.author;
        }

        return p;
    }
}