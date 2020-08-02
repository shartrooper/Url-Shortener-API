const mongoose = require('mongoose');

const urlSchema = mongoose.Schema({
  url: { type: String, required: true },
  shortened:{type: Number}
});

urlSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});


module.exports = mongoose.model('Url', urlSchema);