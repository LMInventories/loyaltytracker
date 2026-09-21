-- Removes the postcode / distance-sorting feature. This permanently deletes
-- every stored customer and business postcode and its geocoded coordinates.

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "postcode";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "postcode";
