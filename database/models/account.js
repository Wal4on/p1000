import mongoose from "mongoose";




const Schema = mongoose.Schema;


const schema = new Schema(
    {
        tgId: { type: Number, required: true, unique: true },
        status: { type: String, required: true},
        isWaitForPay: String,
        nickname: String,
        balance: Number
    }
);




const Account = mongoose.model("Account", schema);




async function isNewUser(id) {
    let accounts = await Account.find({});
    let isNew = true;
    
    for(let acc of accounts) {
        console.log(acc);
        if(acc.tgId == id) {
            isNew = false;
            break;
        }
    }
    
    return isNew;
}




export { Account, isNewUser };