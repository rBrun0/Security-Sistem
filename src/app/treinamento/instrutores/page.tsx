"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  User,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Mail,
  Award,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/src/components/form/form-input";
import { FormTextarea } from "@/src/components/form/form-textarea";
import { toast } from "sonner";

export default function InstrutoresPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingInstrutor, setEditingInstrutor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const instrutorSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    cpf: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    qualifications: z.string().optional(),
  });

  type InstrutorFormData = z.infer<typeof instrutorSchema>;

  const form = useForm<InstrutorFormData>({
    resolver: zodResolver(instrutorSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      email: "",
      qualifications: "",
    },
  });

  const queryClient = useQueryClient();

  const { data: instrutores = [], isLoading } = useQuery({
    queryKey: ["instrutores"],
    queryFn: () => base44.entities.Instrutor.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Instrutor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instrutores"] });
      setIsOpen(false);
      resetForm();
      toast.success("Instrutor cadastrado com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Instrutor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instrutores"] });
      setIsOpen(false);
      setEditingInstrutor(null);
      resetForm();
      toast.success("Instrutor atualizado com sucesso!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Instrutor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instrutores"] });
      toast.success("Instrutor excluído com sucesso!");
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      cpf: "",
      phone: "",
      email: "",
      qualifications: "",
    });
  };

  const onSubmit = (data: InstrutorFormData) => {
    const submitData = {
      nome: data.name,
      cpf: data.cpf,
      email: data.email,
      telefone: data.phone,
      qualificacoes: data.qualifications,
    };

    if (editingInstrutor) {
      updateMutation.mutate({ id: editingInstrutor.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (instrutor) => {
    setEditingInstrutor(instrutor);
    form.reset({
      name: instrutor.nome || "",
      cpf: instrutor.cpf || "",
      phone: instrutor.telefone || "",
      email: instrutor.email || "",
      qualifications: instrutor.qualificacoes || "",
    });
    setIsOpen(true);
  };

  const filteredInstrutores = instrutores.filter((instrutor) =>
    instrutor.nome?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Instrutores</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os instrutores de treinamento
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingInstrutor(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Instrutor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInstrutor ? "Editar Instrutor" : "Novo Instrutor"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormInput
                  name="name"
                  label="Nome Completo"
                  control={form.control}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput name="cpf" label="CPF" control={form.control} />
                  <FormInput
                    name="phone"
                    label="Telefone"
                    control={form.control}
                  />
                </div>

                <FormInput
                  name="email"
                  label="E-mail"
                  type="email"
                  control={form.control}
                />

                <FormTextarea
                  name="qualifications"
                  label="Qualificações"
                  control={form.control}
                  placeholder="Formações, especializações, experiência..."
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {editingInstrutor ? "Salvar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
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
      ) : filteredInstrutores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {searchTerm
                ? "Nenhum instrutor encontrado"
                : "Nenhum instrutor cadastrado"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Instrutor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstrutores.map((instrutor) => (
            <Card
              key={instrutor.id}
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
                        {instrutor.nome}
                      </CardTitle>
                      {instrutor.cpf && (
                        <span className="text-sm text-slate-500">
                          CPF: {instrutor.cpf}
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
                      <DropdownMenuItem onClick={() => handleEdit(instrutor)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (confirm("Deseja excluir este instrutor?")) {
                            deleteMutation.mutate(instrutor.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {instrutor.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="w-4 h-4" />
                    <span>{instrutor.email}</span>
                  </div>
                )}
                {instrutor.telefone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-4 h-4" />
                    <span>{instrutor.telefone}</span>
                  </div>
                )}
                {instrutor.registros_profissionais?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {instrutor.registros_profissionais
                      .filter((r) => r.tipo)
                      .map((reg, i) => (
                        <span
                          key={i}
                          className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                        >
                          {reg.tipo}: {reg.numero}
                        </span>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
