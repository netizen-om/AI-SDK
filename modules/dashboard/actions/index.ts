"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/action";
import { revalidatePath } from "next/cache";

export const getAllPlaygoundForUser = async () => {
  const user = await currentUser();

  try {
    const playgound = await db.playground.findMany({
      where: {
        userId: user?.id,
      },
      include: {
        user: true,
      },
    });

    return playgound;
  } catch (error) {
    console.log("ERROR GETTING USER PLAYGOUND DETAILS");
    console.error(error);
  }
};

export const createPlayground = async (data: {
  title: string;
  template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
  description?: string;
}) => {
  const user = await currentUser();

  const { template, title, description } = data;

  try {
    const playgound = await db.playground.create({
      data: {
        template: template,
        title: title,
        description: description,
        userId: user?.id!,
      },
    });

    return playgound
  } catch (error) {
    console.error(error);
  }
};

export const deleteProjectId = async(id : string) => {
    try {
        await db.playground.delete({
            where : {
                id
            }
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.error(error);
    }
}

export const editProjectById = async(id : string, data : {
    title : string,
    description : string
}) => {
    try {
        await db.playground.update({
            where : {
                id
            },
            data : data
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.error(error);
    }
}

export const duplicateProjectById = async(id : string) => {
    try {
        const originalPlaygound = await db.playground.findUnique({
            where : {
                id
            },
            // TODO : ad template files
        })

        if(!originalPlaygound) {
            throw new Error("Original playgound not found")
        }

        const duplicatedPlaygound = await db.playground.create({
            data : {
                title : `${originalPlaygound.title} (Copy)`,
                description : originalPlaygound.description,
                userId : originalPlaygound.userId,
                template : originalPlaygound.template
            }
        })

        revalidatePath("/dashboard")

        return duplicatedPlaygound;

    } catch (error) {
        console.error(error);
    }
}

