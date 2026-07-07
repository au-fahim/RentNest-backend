import { prisma } from "../../config/prisma.js";

export const createPropertyService = async (
  landlordId: string,
  payload: any,
) => {
  const newProperty = await prisma.property.create({
    data: {
      ...payload,
      landlordId,
    },

    include: {
      category: {
        select: { id: true, name: true },
      },
      landlord: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return newProperty;
};
