import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  // Hash the password before saving
  if (this.isModified("password")) {
    bcrypt.hash(this.password, 12, (err, hash) => {
      if (err) {
        return next(err);
      }
      this.password = hash;
      next();
    });
  } else {
    next();
  }
} );

userSchema.methods.comparePassword = function (password) {
  // Compare the provided password with the hashed password
  return bcrypt.compare(password, this.password);
}


const UserModel = mongoose.model("User", userSchema);
export default UserModel;
