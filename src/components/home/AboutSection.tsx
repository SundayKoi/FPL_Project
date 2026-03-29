import { Shield, Users, Award, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: Shield,
    title: "Franchise Format",
    description:
      "Teams are drafted and managed in a franchise-style system, giving every player a true competitive team experience.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Built by players, for players. Our league thrives on community engagement and fair competition.",
  },
  {
    icon: Award,
    title: "Competitive Play",
    description:
      "Structured matches with standings, playoffs, and a championship. Prove your skills on the biggest stage.",
  },
  {
    icon: Target,
    title: "All Skill Levels",
    description:
      "From Platinum to Diamond, we welcome players of all ranks to compete and improve together.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What is <span className="text-fpl-accent">FPL</span>?
          </h2>
          <p className="text-fpl-muted text-lg max-w-2xl mx-auto">
            The Franchise Premier League is an amateur esports league that
            brings organized, competitive play to dedicated players.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} hover>
              <feature.icon className="h-10 w-10 text-fpl-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-fpl-muted text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
