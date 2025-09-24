"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/action";

export const getAllPlaygoundForUser = async() => {
    const user = await currentUser();

    try {
        const playgound = await db.playground.findMany({
            where : {
                userId : user?.id
            },
            include : {
                user : true
            }
        })

        return playgound
    } catch (error) {
        console.log("ERROR GETTING USER PLAYGOUND DETAILS");    
        console.error(error);
    }
}