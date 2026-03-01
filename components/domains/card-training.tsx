"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  Clock,
  Eye,
  GraduationCap,
  User,
} from "lucide-react";
import { Training } from "@/src/app/modules/trainings/types";
import { Separator } from "../ui/separator";

interface TrainingCardProps {
  training: Training;
  modalityColors: Record<string, string>;
  statusColors: Record<string, string>;
}

export function TrainingCard({
  training,
  modalityColors,
  statusColors,
}: TrainingCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-md cursor-pointer group h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between pb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base group-hover:text-purple-600 transition-colors line-clamp-2">
                {training.title}
              </CardTitle>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  className={modalityColors[training.modality || "presencial"]}
                >
                  {training.modality === "ead"
                    ? "EAD"
                    : training.modality === "presencial"
                      ? "Presencial"
                      : "Semipresencial"}
                </Badge>
                <Badge className={statusColors[training.status || "scheduled"]}>
                  {training.status === "scheduled"
                    ? "Agendado"
                    : training.status === "in_progress"
                      ? "Em Andamento"
                      : "Concluído"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <Separator />
      </CardHeader>

      <CardContent className="pt-3 flex-1 flex flex-col">
        <div className="space-y-2">
          {training.eventDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>
                {training.eventDate}{" "}
                {training.eventTime && `• ${training.eventTime}`}
              </span>
            </div>
          )}

          {training.workload && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{training.workload}</span>
            </div>
          )}

          {(training.location || training.environmentName) && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4" />
              <span className="truncate">
                {training.environmentName || training.location}
              </span>
            </div>
          )}

          {training.instructorName && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4" />
              <span>{training.instructorName}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2 flex items-center justify-end">
          <span className="text-sm text-purple-600 font-medium group-hover:underline flex items-center gap-1">
            <Eye className="w-4 h-4" />
            Ver Detalhes
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
