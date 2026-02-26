const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ message: "Not authorized" });

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded;
    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.onlyAdmin = (req,res,next)=>{
  
  console.log(req.user);
  if(req.user.role!=="admin")return res.status(403).json({message:"Admin Only"});
  next();
}

exports.onlyChef = (req,res,next)=>{
  if(req.user.role!=="chef")return res.status(403).json({message:"Chef only"});
  next();
}