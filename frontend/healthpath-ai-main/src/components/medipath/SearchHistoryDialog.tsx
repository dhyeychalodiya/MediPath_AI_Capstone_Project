import { useState, useEffect } from "react";
import {
  History,
  Trash2,
  ArrowRight,
  Compass,
  Building2,
  MapPin,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  getSearchHistory,
  deleteSearchHistoryItem,
  clearSearchHistory,
  onSearchHistoryUpdate,
  SearchHistoryItem,
} from "@/services/searchHistoryService";
import { toast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectQuery: (query: string) => void;
  onSelectHistoryItem?: (item: SearchHistoryItem) => void;
  language?: string;
};

export const SearchHistoryDialog = ({
  open,
  onOpenChange,
  onSelectQuery,
  onSelectHistoryItem,
  language = "en",
}: Props) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    const load = () => setHistory(getSearchHistory(user.id));
    load();
    const unsubscribe = onSearchHistoryUpdate(load, user.id);
    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  const handleDelete = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSearchHistoryItem(user.id, itemId);
    toast({ title: "Search removed from history" });
  };

  const handleClearAll = () => {
    clearSearchHistory(user.id);
    toast({ title: "Search history cleared" });
  };

  const handleSelect = (item: SearchHistoryItem) => {
    onOpenChange(false);
    if (onSelectHistoryItem) {
      onSelectHistoryItem(item);
    } else {
      onSelectQuery(item.query);
    }
  };

  const formatTime = (ts: number) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <History className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold">
                  {language === "hi"
                    ? "खोज इतिहास"
                    : language === "gu"
                    ? "શોધ ઇતિહાસ"
                    : "Saved Search History"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {language === "hi"
                    ? `${user.name} के लिए फायरबेस क्लाउड में सुरक्षित`
                    : language === "gu"
                    ? `${user.name} માટે ફાયરબેઝ ક્લાઉડમાં સુરક્ષિત રીતે સંગ્રહિત`
                    : `Synced with Firebase Cloud for ${user.name} (${user.id})`}
                </DialogDescription>
              </div>
            </div>

            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {language === "hi" ? "इतिहास साफ करें" : language === "gu" ? "ઇતિહાસ સાફ કરો" : "Clear All"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                <History className="w-6 h-6 opacity-60" />
              </div>
              <p className="font-semibold text-foreground text-sm">
                {language === "hi"
                  ? "कोई सहेजी गई खोज नहीं मिली"
                  : language === "gu"
                  ? "કોઈ સંગ્રહિત શોધ મળી નથી"
                  : "No saved searches yet"}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {language === "hi"
                  ? "जब आप लॉग इन रहकर लक्षण या अस्पताल खोजते हैं, तो आपका इतिहास यहां अपने आप सुरक्षित हो जाता है।"
                  : language === "gu"
                  ? "જ્યારે તમે લૉગ ઇન રહીને લક્ષણો અથવા હોસ્પિટલો શોધો છો, ત્યારે તમારો ઇતિહાસ અહીં આપમેળે સચવાય છે."
                  : "Searches you perform while logged in to your MediPath account are automatically saved here for quick re-consultation."}
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="group p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                      &ldquo;{item.query}&rdquo;
                    </span>
                    {Boolean(item.isDirectRouting || item.directRouting || item.source === "direct_routing" || item.decisionSource === "direct_routing") && (
                      <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 shrink-0">
                        <Compass className="w-3 h-3 text-emerald-500" />
                        {language === "hi" ? "सीधा अस्पताल मार्ग" : language === "gu" ? "સીધો હોસ્પિટલ માર્ગ" : "Direct Hospital Route"}
                      </Badge>
                    )}
                    {item.condition && !(item.isDirectRouting || item.directRouting) && (
                      <Badge variant="secondary" className="text-[11px] font-medium py-0 px-2 bg-primary/10 text-primary border-primary/20">
                        {item.condition}
                      </Badge>
                    )}
                    {item.specialty && (
                      <span className="text-[11px] text-muted-foreground">
                        • {item.specialty}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {formatTime(item.timestamp)}
                    </span>
                    {item.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {item.location}
                      </span>
                    )}
                    {typeof item.hospitalCount === "number" && item.hospitalCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        {item.hospitalCount} hospitals
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                  >
                    <span>{language === "hi" ? "खोजें" : language === "gu" ? "શોધો" : "Search"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3 px-5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
            <span>
              {language === "hi"
                ? `कुल ${history.length} खोजें सुरक्षित हैं`
                : language === "gu"
                ? `કુલ ${history.length} શોધો સંગ્રહિત છે`
                : `Showing ${history.length} saved search records`}
            </span>
            <span className="text-[11px] opacity-75">
              Click any item to search again
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
