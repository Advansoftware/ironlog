"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  resetAllData,
  getDbConnections,
  saveDbConnections,
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Database,
  Trash2,
  Signal,
  Download,
  Link,
  TestTube,
  CheckCircle,
} from "lucide-react";
import type { DbConnectionConfig, WgerConfig } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import {
  getWgerConfig,
  saveWgerConfig,
  isWgerSyncEnabled,
} from "@/lib/storage";
import { Switch } from "@/components/ui/switch";

const dbConnectionSchema = z.object({
  name: z.string().min(1, "O nome da conexão é obrigatório."),
  url: z.string().url("Por favor, insira uma URL do MongoDB válida."),
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

const wgerConfigSchema = z.object({
  enabled: z.boolean(),
  apiUrl: z.string().url("Por favor, insira uma URL válida da API WGER."),
  token: z.string().min(1, "O token de autenticação é obrigatório."),
  username: z.string().optional(),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [connections, setConnections] = useState<DbConnectionConfig[]>([]);
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(
    null
  );
  const [wgerConfig, setWgerConfig] = useState<WgerConfig>({
    enabled: false,
    apiUrl: "",
    token: "",
    username: "",
  });
  const { canInstall, promptInstall } = usePwaInstall();

  const form = useForm<z.infer<typeof dbConnectionSchema>>({
    resolver: zodResolver(dbConnectionSchema),
    defaultValues: {
      name: "",
      url: "",
      email: "",
      password: "",
    },
  });

  const wgerForm = useForm<z.infer<typeof wgerConfigSchema>>({
    resolver: zodResolver(wgerConfigSchema),
    defaultValues: wgerConfig,
  });

  useEffect(() => {
    setConnections(getDbConnections());
    const config = getWgerConfig();
    setWgerConfig(config);
    wgerForm.reset(config);
  }, []);

  const handleAddConnection = (values: z.infer<typeof dbConnectionSchema>) => {
    const newConnection: DbConnectionConfig = { id: uuidv4(), ...values };
    const updatedConnections = [...connections, newConnection];
    saveDbConnections(updatedConnections);
    setConnections(updatedConnections);
    form.reset();
    toast({
      title: "Conexão Salva",
      description:
        "Sua nova configuração de banco de dados foi salva localmente.",
    });
  };

  const handleDeleteConnection = (id: string) => {
    const updatedConnections = connections.filter((c) => c.id !== id);
    saveDbConnections(updatedConnections);
    setConnections(updatedConnections);
    setDeleteDialogOpen(null);
    toast({
      title: "Conexão Removida",
    });
  };

  const handleSaveWgerConfig = (values: z.infer<typeof wgerConfigSchema>) => {
    const newConfig: WgerConfig = { ...values };
    saveWgerConfig(newConfig);
    setWgerConfig(newConfig);
    toast({
      title: "Configuração WGER Salva!",
      description: newConfig.enabled
        ? "A sincronização com WGER está agora habilitada."
        : "A sincronização com WGER foi desabilitada.",
    });
  };

  const testWgerConnection = async () => {
    const config = wgerForm.getValues();
    if (!config.apiUrl || !config.token) {
      toast({
        variant: "destructive",
        title: "Configuração Incompleta",
        description: "Preencha a URL da API e o token antes de testar.",
      });
      return;
    }

    try {
      const response = await fetch(
        `${config.apiUrl}/api/v2/exerciseinfo/?limit=1`,
        {
          headers: {
            Authorization: `Token ${config.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast({
          title: "Conexão Bem-sucedida!",
          description: "As credenciais WGER estão funcionando.",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Erro ao testar WGER:", error);
      toast({
        variant: "destructive",
        title: "Falha na Conexão",
        description: "Verifique a URL da API e o token.",
      });
    }
  };

  const handleResetData = () => {
    try {
      resetAllData();
      toast({
        title: "Dados Resetados!",
        description:
          "Todos os seus dados foram apagados e o app foi restaurado para o estado inicial.",
      });
      // Não redirecionamos mais aqui, a página vai recarregar e o hook da raiz cuida do redirecionamento
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Resetar",
        description: "Não foi possível resetar os dados. Tente novamente.",
      });
    } finally {
      setResetDialogOpen(false);
    }
  };

  return (
    <TooltipProvider>
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações e dados do seu aplicativo."
      />

      {canInstall && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Download className="text-primary" />
              Instalar Aplicativo
            </CardTitle>
            <CardDescription>
              Instale o IronLog na tela inicial do seu dispositivo para ter uma
              experiência mais rápida e integrada, com acesso offline.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={promptInstall}>
              <Download className="mr-2" />
              Instalar no seu dispositivo
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Database className="text-primary" />
            Sincronização de Dados (Em Breve)
          </CardTitle>
          <CardDescription>
            Adicione uma URL de banco de dados MongoDB para sincronizar seus
            dados entre dispositivos.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddConnection)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Conexão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Meu PC de Casa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Conexão do MongoDB</FormLabel>
                    <FormControl>
                      <Input placeholder="mongodb+srv://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu-email@exemplo.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button type="submit" disabled>
                      Adicionar Conexão
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    A funcionalidade de back-end ainda não foi implementada.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {connections.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Conexões Salvas</h3>
          {connections.map((conn) => (
            <Card
              key={conn.id}
              className="flex flex-col md:flex-row items-center justify-between p-4"
            >
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <Database className="text-primary size-6" />
                <div>
                  <p className="font-semibold">{conn.name}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-xs">
                    {conn.url}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0}>
                      <Button variant="outline" disabled className="w-full">
                        <Signal className="mr-2" />
                        Sincronizar
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      A funcionalidade de back-end ainda não foi implementada.
                    </p>
                  </TooltipContent>
                </Tooltip>

                <AlertDialog
                  open={isDeleteDialogOpen === conn.id}
                  onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialogOpen(conn.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover Conexão?</AlertDialogTitle>
                      <AlertDialogDescription>
                        A configuração para "{conn.name}" será removida
                        permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteConnection(conn.id)}
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Seção WGER */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Link className="text-primary" />
            Integração WGER
          </CardTitle>
          <CardDescription>
            Configure sua conta WGER para sincronizar automaticamente suas
            rotinas e sessões de treino.
          </CardDescription>
        </CardHeader>
        <Form {...wgerForm}>
          <form onSubmit={wgerForm.handleSubmit(handleSaveWgerConfig)}>
            <CardContent className="space-y-6">
              {/* Toggle de Habilitação */}
              <FormField
                control={wgerForm.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Habilitar Sincronização WGER
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Sincroniza automaticamente rotinas e sessões com sua
                        conta WGER
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Campos de Configuração */}
              <div className="space-y-4">
                <FormField
                  control={wgerForm.control}
                  name="apiUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da API WGER</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://fit.advansoftware.shop"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        URL base da sua instância WGER (sem /api/v2)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={wgerForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token de Autenticação</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Seu token WGER..."
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Token de API encontrado nas configurações da sua conta
                        WGER
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={wgerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Seu nome de usuário WGER"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Para identificação na interface (opcional)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status da Conexão */}
              {isWgerSyncEnabled() && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="size-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Sincronização WGER ativa
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="submit">Salvar Configuração</Button>
              <Button
                type="button"
                variant="outline"
                onClick={testWgerConnection}
              >
                <TestTube className="mr-2 size-4" />
                Testar Conexão
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <AlertTriangle className="size-8 text-destructive" />
            <div>
              <CardTitle>Zona de Perigo</CardTitle>
              <CardDescription>
                Ações nesta seção são permanentes e não podem ser desfeitas.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ao clicar no botão abaixo, todos os seus dados, incluindo rotinas,
            histórico de treinos, recordes pessoais e progresso de nível, serão
            apagados permanentemente do seu dispositivo. O aplicativo retornará
            ao seu estado inicial.
          </p>
        </CardContent>
        <CardFooter>
          <AlertDialog
            open={isResetDialogOpen}
            onOpenChange={setResetDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Resetar Todos os Dados</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso deletará permanentemente
                  todos os seus dados. Seus treinos, suas rotinas e seu
                  progresso serão perdidos para sempre.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetData}>
                  Sim, eu entendo, apagar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
