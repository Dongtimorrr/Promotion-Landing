const supportEmail = "appledev1920@gmail.com";

const form = document.getElementById("application-form");
const summaryOutput = document.getElementById("summary-output");
const summaryStatus = document.getElementById("summary-status");
const copyButton = document.getElementById("copy-summary");
const emailButton = document.getElementById("email-summary");
const channelUrlInput = form?.elements.namedItem("channelUrl");
const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));

let latestMailtoLink = "";
let latestSummary = "";

function normalizeChannelUrl(rawValue) {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue.replace(/^\/+/, "")}`;
}

function syncChannelUrlInput() {
  if (!(channelUrlInput instanceof HTMLInputElement)) {
    return "";
  }

  const normalizedValue = normalizeChannelUrl(channelUrlInput.value);
  channelUrlInput.value = normalizedValue;

  return normalizedValue;
}

function initializeRevealAnimations() {
  if (!revealElements.length) {
    return;
  }

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -10% 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

function buildSummary(formData) {
  const publishDate = formData.get("publishDate") || "미정";

  return [
    "[GIFdot Creator Access 신청서]",
    "",
    `이름/채널명: ${formData.get("creatorName")}`,
    `이메일: ${formData.get("email")}`,
    `채널 URL: ${formData.get("channelUrl")}`,
    `채널 유형: ${formData.get("channelType")}`,
    `방문자/팔로워 규모: ${formData.get("audience")}`,
    `요청 유형: ${formData.get("requestType")}`,
    `콘텐츠 게시 예정일: ${publishDate}`,
    "",
    "[활용 계획]",
    `${formData.get("notes")}`,
    "",
    "[확인 사항]",
    "프로모션 제공 시 게시물 내 제공 사실 표기 필요 여부를 확인했습니다."
  ].join("\n");
}

function buildMailto(summary, creatorName) {
  const subject = `[GIFdot Creator Access] ${creatorName} 신청`;
  return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
}

async function copySummary() {
  if (!latestSummary) {
    summaryStatus.textContent = "먼저 신청 내용을 생성해주세요.";
    return;
  }

  try {
    await navigator.clipboard.writeText(latestSummary);
    summaryStatus.textContent = "신청 내용이 클립보드에 복사되었습니다.";
  } catch (error) {
    summaryStatus.textContent = "브라우저 권한 문제로 복사에 실패했습니다. 직접 드래그해서 복사해주세요.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  syncChannelUrlInput();

  const formData = new FormData(form);
  latestSummary = buildSummary(formData);
  latestMailtoLink = buildMailto(latestSummary, formData.get("creatorName"));

  summaryOutput.textContent = latestSummary;
  summaryStatus.textContent = "메일 앱을 여는 중입니다. 열리지 않으면 아래 내용을 복사해 직접 보내주세요.";

  try {
    await navigator.clipboard.writeText(latestSummary);
    summaryStatus.textContent = "메일 앱을 여는 중입니다. 같은 내용은 클립보드에도 복사해두었습니다.";
  } catch (error) {
    summaryStatus.textContent = "메일 앱을 여는 중입니다. 자동 복사는 실패했으니 아래 내용을 직접 복사해주세요.";
  }

  window.location.href = latestMailtoLink;
});

if (channelUrlInput instanceof HTMLInputElement) {
  channelUrlInput.addEventListener("input", () => {
    if (!channelUrlInput.value.trim()) {
      return;
    }

    const normalizedValue = normalizeChannelUrl(channelUrlInput.value);

    if (normalizedValue === channelUrlInput.value) {
      return;
    }

    channelUrlInput.value = normalizedValue;
    channelUrlInput.setSelectionRange(normalizedValue.length, normalizedValue.length);
  });

  channelUrlInput.addEventListener("blur", () => {
    if (channelUrlInput.value === "https://") {
      channelUrlInput.value = "";
      return;
    }

    syncChannelUrlInput();
  });
}

copyButton.addEventListener("click", () => {
  void copySummary();
});

emailButton.addEventListener("click", () => {
  if (!latestMailtoLink) {
    summaryStatus.textContent = "먼저 신청 내용을 생성해주세요.";
    return;
  }

  window.location.href = latestMailtoLink;
});

initializeRevealAnimations();
