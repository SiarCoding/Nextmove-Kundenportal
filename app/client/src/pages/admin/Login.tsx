import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../lib/auth";

const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein"),
});

export default function AdminLogin() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setIsLoading(true);
      await login(values.email, values.password, "admin");
      window.location.href = "/admin";
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error?.message || "Anmeldung fehlgeschlagen"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Left side */}
      <div className="hidden lg:flex lg:flex-1 flex-col p-12">
        <div className="mb-auto">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="h-24 w-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Admin Portal
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Melden Sie sich an, um fortzufahren
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-[#25262b] rounded-xl p-8 shadow-2xl border border-border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@firma.de" 
                          className="bg-[#1a1b1e] border-border" 
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
                      <FormLabel>Passwort</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          className="bg-[#1a1b1e] border-border"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Wird geladen..." : "Anmelden"}
                </Button>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = "/"}
                    className="text-muted-foreground hover:text-primary text-sm"
                  >
                    Zum Kundenportal
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
