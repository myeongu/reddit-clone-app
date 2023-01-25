import { NextFunction, Request, Response, Router } from "express";
import jwt from 'jsonwebtoken';
import { User } from "../entities/User";
import userMiddleware from "../middlewares/user"
import authMiddleware from "../middlewares/auth"
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import Sub from "../entities/Sub";
import Post from "../entities/Post";
import multer, { FileFilterCallback } from 'multer';
import { makeId } from "../utils/helper";
import path from "path";
import { unlinkSync } from "fs";

const getSub = async (req: Request, res: Response) => {
    const name = req.params.name;

    try {
        const sub = await Sub.findOneByOrFail({ name });

        return res.json(sub);
    } catch (error) {
        return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다." });
    }
}

const createSub = async (req: Request, res: Response) => {
    const { name, title, description } = req.body;

    try {
        let errors: any = {};
        if (isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
        if (isEmpty(title)) errors.title = "제목은 비워둘 수 없습니다.";

        const sub = await AppDataSource
            .getRepository(Sub)
            .createQueryBuilder("sub")
            .where("lower(sub.name) = :name", { name: name.toLowerCase() })
            .getOne();
        
        if (sub) errors.name = "커뮤니티가 이미 존재합니다.";

        if (Object.keys(errors).length > 0) {
            throw errors;
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }

    try {
        const user: User = res.locals.user;

        const sub = new Sub();
        sub.name = name;
        sub.description = description;
        sub.title = title;
        sub.user = user;

        await sub.save();

        return res.json(sub);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." })
    }
     

}

const topSubs = async (_: Request, res: Response) => {
    try {
        const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn", 'https://www.gravatar.com/avatar?d=mp&f=y')`;
        const subs = await AppDataSource
            .createQueryBuilder()
            .select(
                `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
                )
            .from(Sub, "s")
            .leftJoin(Post, "p", `s.name = p."subName"`)
            .groupBy('s.title, s.name, "imageUrl"')
            .orderBy(`"postCount"`, "DESC")
            .limit(5)
            .execute();
        return res.json(subs);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Somthing went wrong"});
    }
}

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = res.locals.user;

    try {
        const sub = await Sub.findOneOrFail({ where: { name: req.params.name }});

        if (sub.username !== user.username) {
            return res.status(403).json({ error: "이 커뮤니티를 소유하고 있지 않습니다."});
        }

        res.locals.sub = sub;

        return next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다."});
    }
    
}

const upload = multer({
    storage: multer.diskStorage({
        destination: "public/images",
        filename: (_, file, callback) => {
            const name = makeId(15);
            callback(null, name + path.extname(file.originalname));
        },
    }),
    fileFilter: (_, file: any, callback: FileFilterCallback) => {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
            callback(null, true);
        } else {
            callback(new Error("이미지가 아닙니다."));
        }
    }
})

const uploadSubImage = async (req: Request, res: Response) => {
    const sub: Sub = res.locals.sub;
    try {
        const type = req.body.type;

        if (type !== "image" && type !== "banner") {
            if (!req.file?.path) {
                return res.status(400).json({ error: "유효하지 않은 파일"});
            }

            unlinkSync(req.file.path);
            return res.status(400).json({ error: "잘못된 유형"});
        }

        let oldImageUrn: string = "";

        if (type === "image") {
            oldImageUrn = sub.imageUrn || "";
            sub.imageUrn = req.file?.filename || "";
        } else if (type === "banner") {
            oldImageUrn = sub.bannerUrn || "";
            sub.bannerUrn = req.file?.filename || "";
        }
        await sub.save();

        if (oldImageUrn !== "") {
            const fullFileName = path.resolve(
                process.cwd(),
                "public",
                "images",
                oldImageUrn
            );
            unlinkSync(fullFileName);
        }

        return res.json(sub);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다."});
    }
}

const router = Router();

router.get("/:name", userMiddleware, getSub);
router.post("/", userMiddleware, authMiddleware, createSub);
router.get("/sub/topSubs", topSubs);
router.post(
    "/:name/upload",
    userMiddleware,
    authMiddleware,
    ownSub,
    upload.single("file"),
    uploadSubImage
)

export default router;