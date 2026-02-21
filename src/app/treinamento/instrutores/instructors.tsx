"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { AlertDialogBuilder } from "@/components/builders/AlertDialogBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import {
  useDeleteInstrutor,
  useInstructors,
} from "../../modules/instructors/hooks";
import {
  Instructor,
  ProfessionalRegistration,
} from "../../modules/instructors/types";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum instrutor encontrado"
                : "Nenhum instrutor registrado ainda"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <User className="w-4 h-4 mr-2" />
                Registrar primeiro instrutor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((instructor: Instructor) => (
            <Card
              key={instructor.id}
              className="hover:shadow-lg transition-shadow border-0 shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {instructor.name}
                      </CardTitle>
                      {instructor.cpf && (
                        <span className="text-sm text-slate-500">
                          CPF: {instructor.cpf}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(instructor)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>

                      <AlertDialogBuilder
                        title="Excluir Instrutor"
                        description="Esta ação não pode ser desfeita. Deseja continuar?"
                        confirmText="Excluir"
                        variant="destructive"
                        onConfirm={async () => {
                          if (!instructor.id) return;
                          await deleteMutation.mutateAsync(instructor.id);
                        }}
                      >
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </AlertDialogBuilder>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {instructor.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="w-4 h-4" />
                    <span>{instructor.email}</span>
                  </div>
                )}
                {instructor.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-4 h-4" />
                    <span>{instructor.phoneNumber}</span>
                  </div>
                )}
                {instructor?.professionalRegistrations &&
                  instructor?.professionalRegistrations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {instructor.professionalRegistrations
                        .filter((r: ProfessionalRegistration) =>
                          Boolean(r.type),
                        )
                        .map((reg: ProfessionalRegistration, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                          >
                            {reg.type}
                          </span>
                        ))}
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
