"use client";

import {
  Award,
  Briefcase,
  CheckCircle2,
  FileText,
  HelpCircle,
  Info,
  Milestone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Divider } from "@/components/ui";
import { MembershipPlan } from "../../domain/data/response/membership_response";
import { formatDate } from "@/utils/helper/formate_date";
import { formatCurrency } from "@/utils/helper/format_num";

interface MembershipOverviewTabProps {
  plan: MembershipPlan;
}

export function MembershipOverviewTab({ plan }: MembershipOverviewTabProps) {
  const typeName =
    typeof plan.type === "object" && plan.type !== null
      ? plan.type.name
      : (plan.type ?? plan.category ?? "Membership");

  const certImg =
    plan.certificateImage || plan.certificationImage || plan.certificate;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Promotional Hero Banner */}
        {plan.banner && (
          <div className="relative rounded-xl overflow-hidden border border-[#E7E9EB] shadow-xs max-h-52 bg-base-200">
            <img
              src={plan.banner}
              alt=""
              className="w-full h-48 md:h-52 object-cover"
            />
            {plan.bannerText && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex items-end p-5">
                <p className="text-white text-base md:text-lg font-bold tracking-tight drop-shadow-md">
                  {plan.bannerText}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            {plan.image ? (
              <img
                src={plan.image}
                alt=""
                className="w-16 h-16 rounded-xl object-cover border border-[#E7E9EB] shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xl shrink-0">
                {plan.name?.[0] || "M"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-base-content">
                {plan.name}
              </h2>
              <p className="text-sm text-base-content/70 mt-1 leading-relaxed whitespace-pre-wrap">
                {plan.description}
              </p>
            </div>
          </div>

          <Divider />

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
              <p className="text-xs text-base-content/60">Type</p>
              <p className="text-sm font-semibold text-base-content mt-0.5 capitalize">
                {typeName}
              </p>
            </div>
            <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
              <p className="text-xs text-base-content/60">Duration</p>
              <p className="text-sm font-semibold text-base-content mt-0.5">
                {plan.duration || "—"}
              </p>
            </div>
            <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
              <p className="text-xs text-base-content/60">Membership Price</p>
              <p className="text-sm font-semibold text-base-content mt-0.5">
                {formatCurrency(plan.price, {
                  currency: plan.currency || "NGN",
                })}
              </p>
            </div>
            <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
              <p className="text-xs text-base-content/60">Auto-Renewal</p>
              <p className="text-sm font-semibold text-base-content mt-0.5">
                {plan.autoRenewal ? "Enabled" : "Disabled"}
              </p>
            </div>
            {plan.autoRenewal && (
              <>
                <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                  <p className="text-xs text-base-content/60">Renewal Price</p>
                  <p className="text-sm font-semibold text-base-content mt-0.5">
                    {formatCurrency(plan.renewalPrice || plan.price, {
                      currency: plan.currency || "NGN",
                    })}
                  </p>
                </div>
                <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                  <p className="text-xs text-base-content/60">Renewal Cycle</p>
                  <p className="text-sm font-semibold text-base-content mt-0.5 capitalize">
                    {plan.renewalPeriod || "Annually"}
                  </p>
                </div>
              </>
            )}
            {plan.createdDate && (
              <div className="bg-base-200/40 p-3 rounded-lg border border-base-300">
                <p className="text-xs text-base-content/60">Created Date</p>
                <p className="text-sm font-semibold text-base-content mt-0.5">
                  {formatDate(plan.createdDate, "DD MMM YYYY")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Official Certificate Information */}
        {(certImg || plan.certificationText) && (
          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-amber-500" />
              <h3 className="text-base font-bold text-base-content">
                Official Membership Certificate
              </h3>
            </div>
            <Divider />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {certImg && (
                <div className="md:col-span-5 rounded-xl overflow-hidden border border-base-200 bg-base-100 shadow-xs">
                  <img
                    src={certImg}
                    alt="Membership Certificate"
                    className="w-full h-auto object-cover max-h-48"
                  />
                </div>
              )}
              <div
                className={
                  certImg
                    ? "md:col-span-7 space-y-2"
                    : "md:col-span-12 space-y-2"
                }
              >
                <span className="text-xs font-bold text-amber-700 uppercase bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                  Issued Certificate Credential
                </span>
                {plan.certificationText && (
                  <p className="text-sm text-base-content/90 font-medium leading-relaxed pt-1">
                    {plan.certificationText}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Why Join Now Section */}
        {plan.whyJoinNow && (
          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Info size={20} className="text-primary" />
              <h3 className="text-base font-bold text-base-content">
                {plan.whyJoinNow.heading || "Why should I join now?"}
              </h3>
            </div>
            {plan.whyJoinNow.description && (
              <p className="text-sm text-base-content/70 whitespace-pre-line leading-relaxed">
                {plan.whyJoinNow.description}
              </p>
            )}
            {plan.whyJoinNow.highlights &&
              plan.whyJoinNow.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {plan.whyJoinNow.highlights.map((hl: unknown, i: number) => {
                    const text =
                      typeof hl === "string"
                        ? hl
                        : (hl as { value?: string })?.value || "";
                    const key =
                      typeof hl === "object" && hl !== null && "id" in hl
                        ? String((hl as { id?: string }).id)
                        : String(i);

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-semibold"
                      >
                        <CheckCircle2 size={14} className="text-primary shrink-0" />
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            {plan.whyJoinNow.infoCards &&
              plan.whyJoinNow.infoCards.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {plan.whyJoinNow.infoCards.map((card: any, i: number) => (
                    <div
                      key={card.id || i}
                      className="p-3.5 rounded-lg bg-base-200/40 border border-base-300 space-y-1"
                    >
                      <p className="text-xs font-bold text-base-content">
                        {card.title}
                      </p>
                      <p className="text-xs text-base-content/70">
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* How Membership Helps */}
        {plan.howMembershipHelps && plan.howMembershipHelps.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              <h3 className="text-base font-bold text-base-content">
                How Membership Helps
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {plan.howMembershipHelps.map((item: any, i: number) => (
                <div
                  key={item.id || i}
                  className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/60 space-y-2"
                >
                  {item.iconUrl && (
                    <img
                      src={item.iconUrl}
                      alt=""
                      className="w-7 h-7 object-contain"
                    />
                  )}
                  <p className="text-sm font-bold text-base-content">
                    {item.title}
                  </p>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career Pathways & Progression */}
        {plan.careerPathways && plan.careerPathways.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Milestone size={20} className="text-primary" />
              <h3 className="text-base font-bold text-base-content">
                Career Pathways & Progression
              </h3>
            </div>
            <div className="space-y-2.5">
              {plan.careerPathways.map((pathway: unknown, i: number) => {
                const text =
                  typeof pathway === "string"
                    ? pathway
                    : (pathway as { value?: string })?.value || "";
                const key =
                  typeof pathway === "object" &&
                  pathway !== null &&
                  "id" in pathway
                    ? String((pathway as { id?: string }).id)
                    : String(i);

                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm font-semibold text-base-content">
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Job & Career Opportunities */}
        {plan.jobOpportunities && plan.jobOpportunities.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase size={20} className="text-primary" />
              <h3 className="text-base font-bold text-base-content">
                Job & Career Opportunities
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {plan.jobOpportunities.map((job: any, i: number) => (
                <div
                  key={job.id || i}
                  className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/60 space-y-2"
                >
                  {job.iconUrl && (
                    <img
                      src={job.iconUrl}
                      alt=""
                      className="w-7 h-7 object-contain"
                    />
                  )}
                  <p className="text-sm font-bold text-base-content">
                    {job.title}
                  </p>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    {job.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Questions */}
        {plan.applicationQuestions && plan.applicationQuestions.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle size={20} className="text-primary" />
              <h3 className="text-base font-bold text-base-content">
                Application Questions
              </h3>
            </div>
            <div className="space-y-2">
              {plan.applicationQuestions.map((q: unknown, i: number) => {
                const questionText =
                  typeof q === "string"
                    ? q
                    : (q as { question?: string })?.question || "";
                const key =
                  typeof q === "object" && q !== null && "id" in q
                    ? String((q as { id?: string }).id)
                    : String(i);

                return (
                  <div
                    key={key}
                    className="flex items-start gap-3 p-3 rounded-lg bg-base-200/40 border border-base-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-base-content font-medium">
                      {questionText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Member Benefits */}
        <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            <h3 className="text-base font-bold text-base-content">
              Member Benefits & Privileges
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {plan.benefits?.map((benefit: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100"
              >
                <CheckCircle2
                  size={18}
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
                <span className="text-sm text-base-content font-medium leading-snug">
                  {benefit}
                </span>
              </div>
            ))}
            {(!plan.benefits || plan.benefits.length === 0) && (
              <p className="text-sm text-base-content/60">
                No benefits specified.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar: Criteria & Required Documents */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-base-content">
            Eligibility Criteria
          </h3>
          <div className="space-y-2.5">
            {plan.eligibilityCriteria?.map((crit: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-sm text-base-content p-2.5 rounded-lg bg-base-200/40 border border-base-300"
              >
                <span className="w-5 h-5 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{crit}</span>
              </div>
            ))}
            {(!plan.eligibilityCriteria ||
              plan.eligibilityCriteria.length === 0) && (
              <p className="text-sm text-base-content/60">
                No criteria specified.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E7E9EB] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <h3 className="text-base font-bold text-base-content">
              Required Documents
            </h3>
          </div>
          <div className="space-y-2">
            {plan.requiredDocuments?.map((docKey: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#E7E9EB] bg-base-100"
              >
                <FileText size={18} className="text-base-content/70" />
                <span className="text-sm font-medium text-base-content capitalize">
                  {String(docKey).replace(/_/g, " ")}
                </span>
              </div>
            ))}
            {(!plan.requiredDocuments ||
              plan.requiredDocuments.length === 0) && (
              <p className="text-sm text-base-content/60">
                No documents required for registration.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
