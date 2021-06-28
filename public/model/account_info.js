export class AccountInfo {
    constructor(data){
        this.name = data.name;
        this.address = data.address;
        this.city = data.AccountInfo;
        this.state = data.state;
        this.zip = data.zip;
        this.creditNo = data.creditNo;
        this.photoURL = data.photoURL;
    }

    serialize(){
        return {
            name: this.name,
            address: this.address, 
            state:this.state,
            zip: this.zip,
            creditNo: this.creditNo,
            photoURL: this.photoURL,

        }
    }

    //Create default account info obj when the user profile is not set yet
    static instance(){
        return new AccountInfo({
            name:'', address: '', city:'', state:'', zip:'', creditNo: '',
            photoURL:'images/blank_profile.png'
        });
    }
}