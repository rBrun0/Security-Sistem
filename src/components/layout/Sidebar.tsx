"use client";

import React, { useState } from "react";
import { cn, createPageUrl } from "@/lib/utils";
import {
  ClipboardCheck,
  GraduationCap,
  HardHat,
  Menu,
  X,
  Home,
  Users,
  ChevronDown,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const currentPageName = usePathname();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      page: "/",
    },
    {
      title: "Cadastros",
      icon: Users,
      submenu: [
        {
          title: "Ambientes (Obras)",
          href: "cadastros/ambientes",
        },
        { title: "Colaboradores", href: "cadastros/colaboradores" },
      ],
    },
    {
      title: "Inspeção",
      icon: ClipboardCheck,
      submenu: [
        { title: "Inspeções", href: "inspecao/inspecoes" },
        { title: "Relatórios", href: "inspecao/relatorios" },
      ],
    },
    {
      title: "Treinamento",
      icon: GraduationCap,
      submenu: [
        { title: "Modelos", href: "treinamento/modelos" },
        { title: "Turmas", href: "treinamento/turmas" },
        { title: "Instrutores", href: "treinamento/instrutores" },
        { title: "Resp. Técnicos", href: "treinamento/responsaveistecnicos" },
        { title: "Certificados", href: "treinamento/certificados" },
      ],
    },
    {
      title: "Controle de EPI",
      icon: HardHat,
      submenu: [
        { title: "Estoques", href: "controledeepi/estoques" },
        { title: "EPIs", href: "controledeepi/epis" },
        { title: "Movimentações", href: "controledeepi/movimentacoes" },
        { title: "Entregas", href: "controledeepi/entregas" },
        { title: "Relatórios", href: "controledeepi/relatoriosepi" },
      ],
    },
  ];

  const toggleMenu = (title: string | null) => {
    setExpandedMenu(expandedMenu === title ? null : title);
  };

  const activeAccordionUrl = (menuItem: {
    page?: string;
    submenu?: Array<{ href: string }>;
  }) => {
    if (menuItem.page && currentPageName === menuItem.page) {
      return true;
    }
    if (menuItem.submenu) {
      return menuItem.submenu.find((sub) =>
        currentPageName.startsWith(`/${sub.href}`),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="font-bold text-lg text-slate-800">SGS Pro</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-slate-100"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-800 z-40 transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">SGS Pro</h1>
              <p className="text-xs text-slate-400">
                Sistema de Gestão de Segurança
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-100px)]">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all",
                      (expandedMenu === item.title ||
                        activeAccordionUrl(item)) &&
                        "bg-slate-700/50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        expandedMenu === item.title && "rotate-180",
                      )}
                    />
                  </button>
                  {expandedMenu === item.title && (
                    <div className="ml-4 mt-1 space-y-1 animate-in slide-in-from-top-2">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={createPageUrl(sub.href)}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all",
                            currentPageName.startsWith(`/${sub.href}`)
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                              : "text-slate-400 hover:text-white hover:bg-slate-700/30",
                          )}
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              currentPageName.startsWith(`/${sub.href}`)
                                ? "bg-white"
                                : "bg-slate-500",
                            )}
                          />
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    currentPageName === item.page
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-700/50",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Sidebar;
