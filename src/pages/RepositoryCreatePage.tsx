import clsx from "clsx";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { FormErrorList } from "../app/components/FormErrorList.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { zodValidators } from "../app/formValidation.ts";
import {
  FLOW_WRAP_CLASS,
  FLOW_STEP_META_CLASS,
  FLOW_STEP_NAME_CLASS,
  FLOW_STEP_NO_CLASS,
  FORM_CONTROL_INVALID_CLASS,
  MONO_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  WARN_LINE_CLASS,
  buttonClassName,
  flowStepClassName,
} from "../app/styles.ts";

const registrationTypes = ["新規", "既存システム移管"] as const;
const businessDomains = ["金融基盤", "勘定系", "情報系", "共通基盤"] as const;
const primaryLanguages = ["Java", "COBOL85", "PL/I", "TypeScript", "Python"] as const;
const systemClassifications = ["重要システム", "通常システム", "試行・検証"] as const;
const confidentialityLevels = ["社外秘", "社内秘", "公開可"] as const;
const personalInfoOptions = ["含む", "含まない"] as const;
const ossOptions = ["有り", "無し"] as const;
const retentionPeriods = ["3年", "5年", "10年", "無期限"] as const;

const repositoryCreateFieldValidators = {
  repositoryName: z
    .string()
    .regex(/^[a-z0-9-]{3,40}$/, "リポジトリ名は半角英小文字・数字・ハイフンで3～40文字にしてください。"),
  displayName: z.string().min(1, "表示名（日本語）を入力してください。"),
  registrationType: z.enum(registrationTypes),
  businessDomain: z.string().min(1, "事業領域を選択してください。"),
  primaryLanguage: z.string().min(1, "主要言語を選択してください。"),
  systemClassification: z.enum(systemClassifications),
  confidentiality: z.enum(confidentialityLevels),
  containsPersonalInfo: z.enum(personalInfoOptions),
  ossPresence: z.enum(ossOptions),
  description: z.string().min(1, "説明を入力してください。"),
  productionStartDate: z
    .string()
    .refine((value) => value.length === 0 || /^R\d+\/\d{2}\/\d{2}$/.test(value), {
      message: "本番運用開始予定日は R8/12/01 形式で入力してください。",
    }),
  retentionPeriod: z.enum(retentionPeriods),
} as const;

type RepositoryCreateFormValues = {
  repositoryName: string;
  displayName: string;
  registrationType: (typeof registrationTypes)[number];
  businessDomain: string;
  primaryLanguage: string;
  systemClassification: (typeof systemClassifications)[number];
  confidentiality: (typeof confidentialityLevels)[number];
  containsPersonalInfo: (typeof personalInfoOptions)[number];
  ossPresence: (typeof ossOptions)[number];
  description: string;
  productionStartDate: string;
  retentionPeriod: (typeof retentionPeriods)[number];
};

const initialRepositoryCreateValues: RepositoryCreateFormValues = {
  repositoryName: "",
  displayName: "",
  registrationType: "新規",
  businessDomain: "",
  primaryLanguage: "",
  systemClassification: "通常システム",
  confidentiality: "社外秘",
  containsPersonalInfo: "含まない",
  ossPresence: "有り",
  description: "",
  productionStartDate: "",
  retentionPeriod: "10年",
};

const owners = [
  ["1", "責任者", "sato.taichiro", "佐藤 太一郎", "基盤開発二課", "必須", "変更"],
  ["2", "副責任者", "yamada.taro", "山田 太郎", "基盤開発二課", "必須", "変更"],
  ["3", "開発者", "tanaka.ken", "田中 健", "基盤開発二課", "－", "削除"],
  ["4", "レビュア", "suzuki.h", "鈴木 弘子", "品質保証部", "－", "削除"],
];

const attachments = [
  ["1", "システム概要書", "概要書_payment-system-core.docx", "必須", "添付済", "削除"],
  ["2", "影響調査結果", "－（未添付）", "必須", "未添付", "添付"],
  ["3", "セキュリティチェックシート", "－（未添付）", "必須", "未添付", "添付"],
  ["4", "OSS管理票", "－（未添付）", "条件付", "未添付", "添付"],
];

const steps = [
  ["current", "STEP 1", "申請内容入力", ["担当：山田太郎", "状態：入力中"], "▶ 対応中", "inProgress"],
  ["future", "STEP 2", "課長承認", ["承認者：佐藤課長"], "未着手", "required"],
  ["future", "STEP 3", "セキュリティ室確認", ["担当：セキュリティ室"], "未着手", "required"],
  ["future", "STEP 4", "部長承認", ["承認者：田中部長"], "未着手", "required"],
  ["future", "STEP 5", "リポジトリ作成", ["担当：基盤運用部（自動）"], "未着手", "required"],
] as const;

export function RepositoryCreateScreen(): JSX.Element {
  const form = useForm({
    defaultValues: initialRepositoryCreateValues,
    onSubmit: async () => {},
  });

  return (
    <JtcChrome
      screenId="JTC-RPO-003"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "リポジトリ登録申請" }]}
      activeTopMenu="開発管理"
      activeSideItem="リポジトリ登録申請"
      rightColumn={
        <>
          <Panel title="入力進捗" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              <li className={TODO_LIST_ITEM_CLASS}>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#1a7f3c]" />
                  申請者情報
                </span>
                <span className="text-[10px]">完了</span>
              </li>
              <li className={TODO_LIST_ITEM_CLASS}>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#f5d949]" />
                  基本情報
                </span>
                <span className="text-[10px]">7/9</span>
              </li>
              <li className={TODO_LIST_ITEM_CLASS}>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#1a7f3c]" />
                  担当者設定
                </span>
                <span className="text-[10px]">完了</span>
              </li>
              <li className={TODO_LIST_ITEM_CLASS}>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#c8001a]" />
                  書類添付
                </span>
                <span className="text-[10px]">1/3</span>
              </li>
            </ul>
          </Panel>

          <Panel title="参考資料">
            <div className="space-y-1.5 text-[11px] leading-[1.6]">
              <div>
                📄 <span className={TEXT_LINK_CLASS}>リポジトリ登録規程.pdf</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>登録手順書.pdf</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>命名規約.xlsx</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>セキュリティチェックシート（雛形）.xlsx</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>OSS管理票（雛形）.xlsx</span>
              </div>
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className={WARN_LINE_CLASS}>
          <b>申請にあたっての注意事項：</b>本申請は「リポジトリ登録規程 第3条」に基づくものです。
          <span className="font-bold text-[#c8001a]">★</span>
          付項目は必須入力です。記載不備がある場合は差戻しとなりますのでご注意ください。詳細は
          <span className={TEXT_LINK_CLASS}>リポジトリ登録手順書.pdf</span>
          をご確認ください。
        </div>

        <Panel title="申請者情報（自動入力）" bodyClassName="p-0">
          <table className={TABLE_CLASS}>
            <tbody>
              <tr>
                <th>申請者ID</th>
                <td className={MONO_CLASS}>yamada.taro</td>
                <th>氏名</th>
                <td>山田 太郎</td>
              </tr>
              <tr>
                <th>所属</th>
                <td colSpan={3}>第一システム事業本部 デジタル基盤統括部 基盤開発二課</td>
              </tr>
              <tr>
                <th>連絡先</th>
                <td className={MONO_CLASS}>内線 1024 / yamada.taro@jtc-corp.example.co.jp</td>
                <th>申請日時</th>
                <td className={MONO_CLASS}>令和8年5月3日 08:42</td>
              </tr>
            </tbody>
          </table>
        </Panel>

        <Panel title="リポジトリ基本情報" bodyClassName="p-0">
          <table className={TABLE_CLASS}>
            <tbody>
              <tr>
                <th>
                  リポジトリ名<span className="font-bold text-[#c8001a]">★</span>
                </th>
                <td colSpan={3}>
                  <form.Field
                    name="repositoryName"
                    validators={zodValidators(repositoryCreateFieldValidators.repositoryName)}
                  >
                    {(field) => (
                      <>
                        <input
                          name={field.name}
                          className={clsx(
                            "w-[280px] border border-[#888] px-1.5 py-0.5",
                            field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                          )}
                          placeholder="例：payment-system-core"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <span className="ml-2 text-[10px] text-[#555]">
                          ※半角英小文字・数字・ハイフンのみ。3～40文字。
                        </span>
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
              </tr>
              <tr>
                <th>
                  表示名（日本語）<span className="font-bold text-[#c8001a]">★</span>
                </th>
                <td colSpan={3}>
                  <form.Field
                    name="displayName"
                    validators={zodValidators(repositoryCreateFieldValidators.displayName)}
                  >
                    {(field) => (
                      <>
                        <input
                          name={field.name}
                          className={clsx(
                            "w-[380px] border border-[#888] px-1.5 py-0.5",
                            field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                          )}
                          placeholder="例：決済システム基盤ソースコード"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
              </tr>
              <tr>
                <th>管理ID</th>
                <td className={MONO_CLASS}>
                  PRJ-2025-XXXXX <span className="text-[10px] text-[#555]">（自動採番）</span>
                </td>
                <th>
                  登録区分<span className="font-bold text-[#c8001a]">★</span>
                </th>
                <td>
                  <form.Field
                    name="registrationType"
                    validators={zodValidators(repositoryCreateFieldValidators.registrationType)}
                  >
                    {(field) => (
                      <>
                        {registrationTypes.map((registrationType, index) => (
                          <label key={registrationType} className={index === 0 ? "" : "ml-3"}>
                            <input
                              name={field.name}
                              type="radio"
                              checked={field.state.value === registrationType}
                              onBlur={field.handleBlur}
                              onChange={() => field.handleChange(registrationType)}
                            />{" "}
                            {registrationType}
                          </label>
                        ))}
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
              </tr>
              <tr>
                <th>
                  事業領域<span className="font-bold text-[#c8001a]">★</span>
                </th>
                <td>
                  <form.Field
                    name="businessDomain"
                    validators={zodValidators(repositoryCreateFieldValidators.businessDomain)}
                  >
                    {(field) => (
                      <>
                        <select
                          name={field.name}
                          className={clsx(
                            "border border-[#888] px-1 py-0.5",
                            field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                          )}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        >
                          <option value="">──選択してください──</option>
                          {businessDomains.map((businessDomain) => (
                            <option key={businessDomain} value={businessDomain}>
                              {businessDomain}
                            </option>
                          ))}
                        </select>
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
                <th>
                  主要言語<span className="font-bold text-[#c8001a]">★</span>
                </th>
                <td>
                  <form.Field
                    name="primaryLanguage"
                    validators={zodValidators(repositoryCreateFieldValidators.primaryLanguage)}
                  >
                    {(field) => (
                      <>
                        <select
                          name={field.name}
                          className={clsx(
                            "border border-[#888] px-1 py-0.5",
                            field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                          )}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        >
                          <option value="">──選択してください──</option>
                          {primaryLanguages.map((primaryLanguage) => (
                            <option key={primaryLanguage} value={primaryLanguage}>
                              {primaryLanguage}
                            </option>
                          ))}
                        </select>
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
              </tr>
              <tr>
                <th>
                  システム分類<span className="font-bold text-[#c8001a]">★</span>
                </th>
                <td colSpan={3}>
                  <form.Field
                    name="systemClassification"
                    validators={zodValidators(repositoryCreateFieldValidators.systemClassification)}
                  >
                    {(field) => (
                      <>
                        {systemClassifications.map((systemClassification, index) => (
                          <label key={systemClassification} className={index === 0 ? "" : "ml-3"}>
                            <input
                              name={field.name}
                              type="radio"
                              checked={field.state.value === systemClassification}
                              onBlur={field.handleBlur}
                              onChange={() => field.handleChange(systemClassification)}
                            />{" "}
                            {systemClassification}
                          </label>
                        ))}
                        <span className="ml-2 text-[10px] text-[#555]">
                          ※重要システムは別途承認会議が必要
                        </span>
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
              </tr>
              <tr>
                <th>
                  機密区分<span className="font-bold text-[#c8001a]">★</span>
                </th>
                <td colSpan={3}>
                  <form.Field
                    name="confidentiality"
                    validators={zodValidators(repositoryCreateFieldValidators.confidentiality)}
                  >
                    {(field) => (
                      <>
                        {confidentialityLevels.map((confidentiality, index) => (
                          <label key={confidentiality} className={index === 0 ? "" : "ml-3"}>
                            <input
                              name={field.name}
                              type="radio"
                              checked={field.state.value === confidentiality}
                              onBlur={field.handleBlur}
                              onChange={() => field.handleChange(confidentiality)}
                            />{" "}
                            {confidentiality}
                          </label>
                        ))}
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
              </tr>
              <tr>
                <th>
                  個人情報を含む<span className="font-bold text-[#c8001a]">★</span>
                </th>
                <td>
                  <form.Field
                    name="containsPersonalInfo"
                    validators={zodValidators(repositoryCreateFieldValidators.containsPersonalInfo)}
                  >
                    {(field) => (
                      <>
                        {personalInfoOptions.map((containsPersonalInfo, index) => (
                          <label key={containsPersonalInfo} className={index === 0 ? "" : "ml-3"}>
                            <input
                              name={field.name}
                              type="radio"
                              checked={field.state.value === containsPersonalInfo}
                              onBlur={field.handleBlur}
                              onChange={() => field.handleChange(containsPersonalInfo)}
                            />{" "}
                            {containsPersonalInfo}
                          </label>
                        ))}
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
                <th>OSS含有</th>
                <td>
                  <form.Field
                    name="ossPresence"
                    validators={zodValidators(repositoryCreateFieldValidators.ossPresence)}
                  >
                    {(field) => (
                      <>
                        {ossOptions.map((ossPresence, index) => (
                          <label key={ossPresence} className={index === 0 ? "" : "ml-3"}>
                            <input
                              name={field.name}
                              type="radio"
                              checked={field.state.value === ossPresence}
                              onBlur={field.handleBlur}
                              onChange={() => field.handleChange(ossPresence)}
                            />{" "}
                            {ossPresence}
                          </label>
                        ))}
                        <span className="ml-2 text-[10px] text-[#555]">※有りの場合 OSS 管理票を別途提出</span>
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
              </tr>
              <tr>
                <th>
                  説明<span className="font-bold text-[#c8001a]">★</span>
                </th>
                <td colSpan={3}>
                  <form.Field
                    name="description"
                    validators={zodValidators(repositoryCreateFieldValidators.description)}
                  >
                    {(field) => (
                      <>
                        <textarea
                          name={field.name}
                          className={clsx(
                            "h-[60px] w-full border border-[#888] px-1.5 py-0.5",
                            field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                          )}
                          placeholder="リポジトリの目的・取扱範囲を記載してください（200文字以上推奨）"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
              </tr>
              <tr>
                <th>本番運用開始予定日</th>
                <td className={MONO_CLASS}>
                  <form.Field
                    name="productionStartDate"
                    validators={zodValidators(repositoryCreateFieldValidators.productionStartDate)}
                  >
                    {(field) => (
                      <>
                        <input
                          name={field.name}
                          className={clsx(
                            "w-[100px] border border-[#888] px-1.5 py-0.5",
                            field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                          )}
                          placeholder="R8/12/01"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
                <th>想定保管期間</th>
                <td>
                  <form.Field
                    name="retentionPeriod"
                    validators={zodValidators(repositoryCreateFieldValidators.retentionPeriod)}
                  >
                    {(field) => (
                      <>
                        <select
                          name={field.name}
                          className={clsx(
                            "border border-[#888] px-1 py-0.5",
                            field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                          )}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(
                              event.target.value as RepositoryCreateFormValues["retentionPeriod"],
                            )
                          }
                        >
                          {retentionPeriods.map((retentionPeriod) => (
                            <option key={retentionPeriod} value={retentionPeriod}>
                              {retentionPeriod}
                            </option>
                          ))}
                        </select>
                        <FormErrorList errors={field.state.meta.errors} />
                      </>
                    )}
                  </form.Field>
                </td>
              </tr>
            </tbody>
          </table>
        </Panel>

        <Panel title="担当者・権限設定" bodyClassName="p-0">
          <table className={TABLE_CLASS}>
            <thead>
              <tr>
                <th className="w-[40px]">No</th>
                <th className="w-[100px]">区分</th>
                <th className="w-[130px]">ユーザーID</th>
                <th>氏名</th>
                <th className="w-[100px]">所属</th>
                <th className="w-[80px]">必須</th>
                <th className="w-[60px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {owners.map(([no, kind, id, name, dept, required, action]) => (
                <tr key={no}>
                  <td className="text-center">{no}</td>
                  <td className="text-center">
                    {kind === "責任者" || kind === "副責任者" ? <b>{kind}</b> : kind}
                  </td>
                  <td className={MONO_CLASS}>{id}</td>
                  <td>{name}</td>
                  <td className="text-center">{dept}</td>
                  <td className="text-center">
                    {required === "必須" ? <JtcStatusTag tone="done">必須</JtcStatusTag> : "－"}
                  </td>
                  <td className="text-center">
                    <span className={TEXT_LINK_CLASS}>{action}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-t-[#c5c5c5] bg-[#f4f6fa] px-1.5 py-1 text-right">
            <button type="button" className={buttonClassName()}>
              ＋ 担当者追加
            </button>
          </div>
        </Panel>

        <Panel title="関連書類添付" bodyClassName="p-0">
          <table className={TABLE_CLASS}>
            <thead>
              <tr>
                <th className="w-[40px]">No</th>
                <th className="w-[200px]">書類種別</th>
                <th>ファイル名</th>
                <th className="w-[80px]">必須</th>
                <th className="w-[80px]">状態</th>
                <th className="w-[80px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map(([no, kind, file, required, status, action]) => (
                <tr key={no}>
                  <td className="text-center">{no}</td>
                  <td>{kind}</td>
                  <td className={MONO_CLASS}>{file}</td>
                  <td className="text-center">
                    {required === "必須" ? <JtcStatusTag tone="done">必須</JtcStatusTag> : required}
                  </td>
                  <td className="text-center">
                    <JtcStatusTag tone={status === "添付済" ? "done" : "rejected"}>{status}</JtcStatusTag>
                  </td>
                  <td className="text-center">
                    <span className={TEXT_LINK_CLASS}>{action}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="承認フロー（予定)">
          <div className={FLOW_WRAP_CLASS}>
            {steps.map(([state, step, title, meta, statusLabel, tone]) => (
              <div key={step} className={flowStepClassName(state)}>
                <div className={FLOW_STEP_NO_CLASS}>{step}</div>
                <div className={FLOW_STEP_NAME_CLASS}>{title}</div>
                <div className={FLOW_STEP_META_CLASS}>
                  {meta.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
                <div className="mt-2">
                  <JtcStatusTag tone={tone}>{statusLabel}</JtcStatusTag>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="mb-1 border border-[#c5c5c5] bg-white px-2 py-3 text-center">
          <div className="mb-2 text-[10px] text-[#555]">
            ※申請内容は登録後の修正が困難です。十分にご確認のうえ申請してください。
          </div>
          <button type="button" className={buttonClassName()}>
            下書き保存
          </button>
          <span className="px-1" />
          <button type="submit" className={buttonClassName({ tone: "primary", size: "lg" })}>
            申請する
          </button>
          <span className="px-1" />
          <button type="button" className={buttonClassName()}>
            キャンセル
          </button>
        </div>
      </form>
    </JtcChrome>
  );
}

export default function RepositoryCreatePage(): JSX.Element {
  return <RepositoryCreateScreen />;
}
