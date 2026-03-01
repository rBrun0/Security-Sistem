"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { User, Search } from "lucide-react";
import {
  useDeleteInstrutor,
  useInstructors,
} from "../../modules/instructors/hooks";
import { Instructor } from "../../modules/instructors/types";
import { InstructorCard } from "@/components/domains/card-instructor";
import { EmptyStateCard, LoadingCardGrid } from "@/src/components/common";

export const Instructors = ({
  setEditingInstructor,
  isOpen,
  setIsOpen,
}: {
  setEditingInstructor: Dispatch<SetStateAction<Instructor | null>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: instructors = [], isLoading } = useInstructors();
  const deleteMutation = useDeleteInstrutor();

  const handleEdit = (instrutor: Instructor) => {
    setEditingInstructor(instrutor);
    setIsOpen(true);
  };

  const filtered = instructors.filter((i: Instructor) =>
    (i.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {isLoading ? (
        <LoadingCardGrid lineWidths={["w-3/4", "w-1/2"]} />
      ) : filtered.length === 0 ? (
        <EmptyStateCard
          icon={User}
          message={
            searchTerm
              ? "Nenhum instrutor encontrado"
              : "Nenhum instrutor registrado ainda"
          }
          actionLabel={!searchTerm ? "Registrar primeiro instrutor" : undefined}
          actionIcon={!searchTerm ? User : undefined}
          onAction={!searchTerm ? () => setIsOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((instructor: Instructor) => (
            <InstructorCard
              key={instructor.id}
              instructor={instructor}
              onEdit={handleEdit}
              onDelete={async (currentInstructor) => {
                if (!currentInstructor.id) return;
                await deleteMutation.mutateAsync(currentInstructor.id);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};
