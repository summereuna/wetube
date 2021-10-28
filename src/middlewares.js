import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

//s3 오브젝트 만들기
//옵션으로 AWS_ID와 AWS_SECRET 둘 다 옵션으로 전달해야 한다.
const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

//multer s3 만들기
const multerUploader = multerS3({
  s3: s3,
  bucket: "vlog2021",
  //acl 추가
  acl: "public-read",
});

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Vlog";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

//로그인하지 않은 사용자가 로그인한 유저만 접근할 수 있는 페이지에 접근하는 것 방지하기 위한 미들웨어(에딧, 프로필 페이지)
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "로그인 후 이용하세요.");
    return res.redirect("/login");
  }
};

//로그인하지 않은 사용자만 이용하는 url에 추가할 미들웨어(로그인 페이지, 가입 페이지)
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "승인되지 않은 접근입니다.");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
  //파일시스템이 아닌 AWS 사용할 거기 때문에 aws-sdk 패키지 다운받아야 함
  storage: multerUploader,
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 30000000,
  },
  storage: multerUploader,
});
