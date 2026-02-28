import { useUserProfile } from "@/hooks/useData";
import { AVAILABLE_BADGES } from "@/config/gamification";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Flame, Trophy } from "lucide-react";

export function GamificationProfile() {
    const { profile } = useUserProfile();

    const prevLevelThreshold = (profile.level - 1) * 1000;
    const currentLevelThreshold = profile.level * 1000;
    const levelProgress = Math.min(100, Math.max(0, ((profile.xp - prevLevelThreshold) / (currentLevelThreshold - prevLevelThreshold)) * 100));

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg border-4 border-white/10">
                    <span className="text-3xl font-black text-white">{profile.level}</span>
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-baseline">
                        <h3 className="text-xl font-bold">{profile.name}</h3>
                        <span className="text-sm font-medium text-muted-foreground">{profile.xp} XP</span>
                    </div>
                    <div className="space-y-1">
                        <Progress value={levelProgress} className="h-3" />
                        <p className="text-xs text-muted-foreground text-right">
                            {Math.floor(profile.xp - prevLevelThreshold)} / 1000 XP to Level {profile.level + 1}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="card-modern border-0 bg-orange-500/10 dark:bg-orange-500/5">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-600">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.currentStreak}</p>
                            <p className="text-xs text-muted-foreground">Day Streak</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-modern border-0 bg-yellow-500/10 dark:bg-yellow-500/5">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-600">
                            <Crown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.badges.length}</p>
                            <p className="text-xs text-muted-foreground">Badges</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Badges Grid */}
            <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-violet-500" /> Collection
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AVAILABLE_BADGES.map((badge) => {
                        const isUnlocked = profile.badges.some((b) => b.id === badge.id);
                        const Icon = badge.iconComponent;

                        return (
                            <div
                                key={badge.id}
                                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${isUnlocked
                                        ? 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-200 dark:border-violet-800'
                                        : 'bg-muted/50 border-transparent opacity-60 grayscale'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${isUnlocked ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400' : 'bg-muted text-muted-foreground'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold leading-tight">{badge.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{badge.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
