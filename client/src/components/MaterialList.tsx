import { Material } from "../types/course";
import MaterialCard from "./MaterialCard";

const MaterialList = ({ 
  materials, 
  pdfFiles, 
  setPdfFiles 
  }: { 
  materials: Material[], 
  pdfFiles: Record<string, { file: File; url: string }>, 
  setPdfFiles: React.Dispatch<React.SetStateAction<Record<string, { file: File; url: string }>>>
}) => {
  return (
    <div className="space-y-4">
      {materials.map((material, index) => (
        <MaterialCard
          key={index}
          material={material}
          pdfFiles={pdfFiles}
          setPdfFiles={setPdfFiles}
        />
      ))}
    </div>
  );
};

export default MaterialList;