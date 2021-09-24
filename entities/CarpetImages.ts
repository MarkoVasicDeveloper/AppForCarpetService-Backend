import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CarpetReception } from "./CarpetReception";

@Index("FK__carpet_reception", ["carpetReceptionId"], {})
@Entity("carpet_images", { schema: "apiperionica" })
export class CarpetImages {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "carpet_images_id",
    unsigned: true,
  })
  carpetImagesId: number;

  @Column("int", {
    name: "carpet_reception_id",
    unsigned: true,
    default: () => "'0'",
  })
  carpetReceptionId: number;

  @Column("varchar", { name: "image_path", length: 255, default: () => "'0'" })
  imagePath: string;

  @ManyToOne(
    () => CarpetReception,
    (carpetReception) => carpetReception.carpetImages,
    { onDelete: "RESTRICT", onUpdate: "CASCADE" }
  )
  @JoinColumn([
    { name: "carpet_reception_id", referencedColumnName: "carpetReception" },
  ])
  carpetReception: CarpetReception;
}
