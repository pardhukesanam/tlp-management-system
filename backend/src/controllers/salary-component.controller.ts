import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class SalaryComponentController {

  static async createSalaryComponent(
    req: Request,
    res: Response
  ) {
    try {

      const {
        salaryProfileId,
        componentName,
        amount,
        componentType,
      } = req.body;

      if (
        !salaryProfileId ||
        !componentName ||
        !amount ||
        !componentType
      ) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      const profile =
        await prisma.salaryProfile.findUnique({
          where: {
            id: salaryProfileId,
          },
        });

      if (!profile) {
        return res.status(404).json({
          message: "Salary profile not found",
        });
      }
      const existingComponent =
        await prisma.salaryComponent.findFirst({
          where: {
            salaryProfileId,
            componentName,
          },
        });

      if (existingComponent) {
        return res.status(400).json({
          message:
            "Component already exists",
        });
      }
      const lastComponent =
        await prisma.salaryComponent.findFirst({
          where: {
            salaryProfileId,
          },
          orderBy: {
            displayOrder: "desc",
          },
        });

      const component =
        await prisma.salaryComponent.create({
          data: {
            salaryProfileId,
            componentName,
            amount,
            componentType,

            displayOrder:
              (lastComponent?.displayOrder || 0) + 1,
          },
        });

      return res.status(201).json({
        message:
          "Salary component created successfully",
        component,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async getSalaryComponents(
    req: Request<{ salaryProfileId: string }>,
    res: Response
  ) {
    try {

      const { salaryProfileId } =
        req.params;

      const components =
        await prisma.salaryComponent.findMany({
          where: {
            salaryProfileId,
          },

          orderBy: {
            displayOrder: "asc",
          }
        });

      return res.status(200).json(
        components
      );

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async updateSalaryComponent(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {

      const { id } = req.params;

      const {
        amount,
        componentName,
        componentType,
      } = req.body;

      const component =
        await prisma.salaryComponent.findUnique({
          where: { id },
        });

      if (!component) {
        return res.status(404).json({
          message: "Component not found",
        });
      }

      const updatedComponent =
        await prisma.salaryComponent.update({
          where: { id },

          data: {
            amount,
            componentName,
            componentType,
          },
        });

      return res.status(200).json({
        message:
          "Component updated successfully",

        component:
          updatedComponent,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }
  static async deleteSalaryComponent(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {

      const { id } = req.params;

      const component =
        await prisma.salaryComponent.findUnique({
          where: { id },
        });

      if (!component) {
        return res.status(404).json({
          message:
            "Component not found",
        });
      }

      await prisma.salaryComponent.delete({
        where: { id },
      });

      return res.status(200).json({
        message:
          "Component deleted successfully",
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }

  static async reorderSalaryComponents(
    req: Request,
    res: Response
  ) {
    try {
      const { components } = req.body;

      if (!components || !Array.isArray(components) || components.length === 0) {
        return res.status(400).json({
          message: "Components array is required and cannot be empty",
        });
      }

      for (const component of components) {
        if (!component.id) {
          return res.status(400).json({
            message: "Each component must have an id",
          });
        }
      }

      await prisma.$transaction(
        components.map(
          (component, index) =>
            prisma.salaryComponent.update({
              where: {
                id: component.id,
              },
              data: {
                displayOrder: index + 1,
              },
            })
        )
      );

      return res.status(200).json({
        message: "Component order updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}