export class Review {
    constructor(data) {
        this.stars = data.starRating;
        this.comment = data.comment;
        this.author = data.author;
    }

    // Next, we define serialize to convert product to a 
    // form compatible with firestore datatype
    serialize() {
        return {
            stars: this.stars,
            comment: this.comment,
            author: this.author
        };
    }

    static isSerializedComment(p) {
        if (!p.stars) return false;
        if (!p.comment) return false;
        if (!p.author) return false;

        return true;
    }

    serializeForUpdate() {
        const p = {};
        if (this.stars) {
            p.name = this.stars;
        }
        if (this.comment) {
            p.comment = this.comment;
        }
        if (this.author) {
            p.author = this.author;
        }

        return p;
    }
}