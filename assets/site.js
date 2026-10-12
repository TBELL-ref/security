(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (!page || page === "") page = "index.html";

  document.querySelectorAll(".site-nav a, .top-actions a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split("/").pop();
    if (href === page) a.setAttribute("aria-current", "page");
  });

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        btn.textContent = "복사됨";
        setTimeout(function () { btn.textContent = "복사"; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, selectMail);
      } else {
        selectMail();
      }
    });
  });

  function selectMail() {
    var el = document.getElementById("mail");
    if (!el) return;
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  var $ = function (id) { return document.getElementById(id); };
  var on = function (id) {
    var el = $(id);
    return !!(el && el.checked);
  };

  var navi = $("navi-form");
  if (navi) {
    var lastOut = [];
    var lastPlan = null;
    var BADGE = {
      must: ["b-must", "의무"],
      soon: ["b-soon", "예정"],
      check: ["b-check", "확인 필요"],
      rec: ["b-rec", "권장"]
    };

    function diagnose() {
      var sector = $("q-sector").value;
      var hasIsms = on("h-isms");
      var hasIsmsp = on("h-ismsp");
      var hasIso = on("h-iso");
      var certified = hasIsms || hasIsmsp;
      var out = [];
      lastOut = out;

      if (on("q-rev") || on("q-users") || on("q-infra")) {
        out.push(certified
          ? ["must", "ISMS 인증 유지(의무대상)", "의무대상에 해당합니다. 매년 사후심사와 3년 주기 갱신심사를 받아야 합니다."]
          : ["must", "ISMS 인증 취득(의무대상)", "정보통신망법상 의무대상으로 보입니다. 인증을 받지 않으면 3,000만 원 이하 과태료 대상입니다."]);
      } else if (sector === "medical" || sector === "univ") {
        out.push(["check", "ISMS 의무대상 여부", "연간 매출액 또는 세입 1,500억 원 이상인 상급종합병원·재학생 1만 명 이상 대학은 의무대상입니다."]);
      }

      if (on("q-pii")) {
        out.push(hasIsmsp
          ? ["soon", "ISMS-P 강화 기준 대비", "2027년 등급제·예비심사·기술심사가 적용됩니다. 다음 심사 전에 핵심 통제 점검이 필요합니다."]
          : ["soon", "ISMS-P 의무화 대상 가능성 (2027.07 예정)", "중요 개인정보처리자 대상 의무화가 예정되어 있습니다. 대상 기준은 고시로 확정될 예정입니다." + (hasIsms ? " 보유 중인 ISMS에 개인정보 21개 항목을 더해 전환할 수 있습니다." : "")]);
      }

      if (certified && !(on("q-pii") && hasIsmsp)) {
        out.push(["soon", "2027 인증 심사 개편 대비", "보유 인증의 다음 심사부터 예비심사·기술심사·사후관리 강화가 적용될 수 있습니다."]);
      }

      if (on("q-ai")) {
        out.push(["must", "AI 기본법 의무 검토 (2026.01.22 시행)", "생성형 AI 결과물 표시, 고영향 AI 해당 여부와 사업자 책무를 검토해야 합니다."]);
        if (on("q-global")) out.push(["rec", "ISO/IEC 42001 (AI 경영시스템)", "해외 고객에게 AI 거버넌스 수준을 증명할 수 있는 국제 인증입니다."]);
      }

      if (on("q-cloud")) {
        out.push(["must", "클라우드 보안인증(CSAP)", "공공기관이 이용하는 클라우드 서비스는 CSAP 인증이 필요합니다. 서비스 유형과 등급에 따라 요건이 다릅니다."]);
      }

      if (hasIso) {
        out.push(["check", "ISO 27001:2022 전환 여부", "2013판 인증은 2025년 10월 31일에 효력이 끝났습니다. 2022판으로 전환되었는지 확인하세요."]);
      } else if (on("q-global")) {
        out.push(["rec", "ISO/IEC 27001" + (on("q-pii") ? "·27701" : ""), "해외 고객사와 계약할 때 보안 수준 증명 자료로 가장 많이 요구됩니다." + (certified ? " 보유 인증과 매핑해 중복 작업을 줄일 수 있습니다." : "")]);
      }

      if (on("q-listed") || on("q-infra") || on("q-users") || sector === "medical") {
        out.push(["check", "정보보호 공시 의무 여부", "매출·이용자 규모와 업종에 따라 정보보호 투자·인력 현황을 매년 공시해야 할 수 있습니다."]);
      }

      if (sector === "finance") {
        out.push(["check", "전자금융 관련 규정", "전자금융거래법·전자금융감독규정에 따른 별도 보안 요구사항과 평가 대상 여부를 확인해야 합니다."]);
      }

      var list = $("r-list");
      list.textContent = "";
      if (!out.length) {
        var empty = document.createElement("li");
        empty.className = "r-empty";
        empty.textContent = "선택한 조건으로는 의무 대상이 보이지 않습니다. 개인정보를 처리한다면 개인정보 보호법의 안전성 확보조치 기준은 모든 조직에 적용됩니다.";
        list.appendChild(empty);
      }
      var counts = { must: 0, soon: 0, check: 0, rec: 0 };
      out.forEach(function (row) {
        counts[row[0]]++;
        var li = document.createElement("li");
        li.className = "r-item";
        var badge = document.createElement("span");
        badge.className = "r-badge " + BADGE[row[0]][0];
        badge.textContent = BADGE[row[0]][1];
        var body = document.createElement("div");
        var title = document.createElement("h3");
        title.textContent = row[1];
        var desc = document.createElement("p");
        desc.textContent = row[2];
        body.appendChild(title);
        body.appendChild(desc);
        li.appendChild(badge);
        li.appendChild(body);
        list.appendChild(li);
      });
      $("r-sum").innerHTML = out.length
        ? "의무 <b>" + counts.must + "</b> · 예정 <b>" + counts.soon + "</b> · 확인 필요 <b>" + counts.check + "</b> · 권장 <b>" + counts.rec + "</b>"
        : "";
    }

    /* Week spans mirror certification.html ISMS-P gantt; start `w` drives reverse calc. */
    var PHASES = [
      { w: -30, endW: -28, name: "착수·범위 정의", group: "prep", key: true },
      { w: -28, endW: -24, name: "현황 분석·GAP", group: "prep" },
      { w: -24, endW: -20, name: "위험평가·DoA 결정", group: "prep" },
      { w: -22, endW: -16, name: "보호대책·정책 제·개정", group: "prep" },
      { w: -18, endW: 2, name: "관리체계 운영·증적 축적", group: "ops", note: "신청 전 2개월 이상 운영" },
      { w: -18, endW: -16, name: "임직원 인증 교육", group: "ops" },
      { w: -12, endW: -9, name: "내부점검·모의심사", group: "prep" },
      { w: -9, endW: -8, name: "인증 신청", group: "prep", key: true },
      { w: -6, endW: -4, name: "인증기관 예비점검", group: "audit", note: "심사 6~8주 전" },
      { w: 0, endW: 2, name: "인증심사", group: "audit", key: true },
      { w: 10, endW: 12, name: "인증서 발급 예상", group: "audit", note: "보완조치·인증위원회 심의 후" }
    ];
    var DAY = 86400000;
    var schedRanges = [];
    var activePhase = 0;

    function fmt(d) {
      return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
    }

    function parseIso(value) {
      if (!value) return null;
      var parts = value.split("-");
      return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    }

    function addDays(d, n) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    }

    function buildRanges(target, today) {
      return PHASES.map(function (phase) {
        var start = new Date(target.getTime() + phase.w * 7 * DAY);
        var end = addDays(new Date(target.getTime() + phase.endW * 7 * DAY), -1);
        if (end < start) end = start;
        var weeks = Math.max(1, phase.endW - phase.w);
        return {
          start: start,
          end: end,
          weeks: weeks,
          name: phase.name,
          note: phase.note || "",
          key: !!phase.key,
          group: phase.group || "prep",
          past: end < today,
          w: phase.w,
          off: (phase.w === 0 ? "심사 주차" : (phase.w < 0 ? "심사 " + (-phase.w) + "주 전 시작" : "심사 " + phase.w + "주 후")) + (phase.note ? " · " + phase.note : "")
        };
      });
    }

    function clear(el) {
      if (el) el.textContent = "";
    }

    function renderSummary(target, start, today, daysLeft) {
      var host = $("plan-summary");
      if (!host) return;
      clear(host);
      var cards = [
        {
          k: "준비 시작일",
          v: fmt(start),
          s: daysLeft >= 0 ? "권장 착수일 · D-" + daysLeft : "권장 착수일이 지남",
          cls: daysLeft >= 0 ? "is-focus" : "is-warn"
        },
        {
          k: "목표 심사일",
          v: fmt(target),
          s: "인증심사 시작 기준",
          cls: ""
        },
        daysLeft >= 0
          ? {
            k: "일정 여유",
            v: "D-" + daysLeft,
            s: "권장 일정으로 충분합니다",
            cls: "is-ok"
          }
          : {
            k: "일정 부족",
            v: "약 " + Math.ceil(-daysLeft / 7) + "주",
            s: "단축·병행 일정이 필요합니다",
            cls: "is-warn"
          }
      ];
      if (target <= today) {
        cards[2] = {
          k: "일정 상태",
          v: "목표일 경과",
          s: "다른 심사일을 선택하세요",
          cls: "is-warn"
        };
      }
      cards.forEach(function (card) {
        var art = document.createElement("article");
        art.className = "plan-metric" + (card.cls ? " " + card.cls : "");
        art.innerHTML = "<div class=\"k\">" + card.k + "</div><div class=\"v\">" + card.v + "</div><div class=\"s\">" + card.s + "</div>";
        host.appendChild(art);
      });
    }

    function setActivePhase(index) {
      activePhase = index;
      var rows = document.querySelectorAll(".plan-gantt-row");
      rows.forEach(function (row, i) {
        row.classList.toggle("is-active", i === index);
      });
      var detail = $("plan-detail");
      var range = schedRanges[index];
      if (!detail || !range) return;
      detail.innerHTML =
        "<div class=\"d-k\">선택한 단계</div>" +
        "<div class=\"d-v\"><b>" + range.name + "</b> · " + fmt(range.start) + " ~ " + fmt(range.end) +
        " · 약 " + range.weeks + "주" +
        (range.off ? "<br>" + range.off : "") +
        (range.note && range.off.indexOf(range.note) === -1 ? "<br>" + range.note : "") +
        "</div>";
    }

    function renderGantt() {
      var host = $("sched-cal");
      if (!host) return;
      clear(host);
      if (!schedRanges.length) return;

      var origin = schedRanges.reduce(function (min, r) { return r.start < min ? r.start : min; }, schedRanges[0].start);
      var finish = schedRanges.reduce(function (max, r) { return r.end > max ? r.end : max; }, schedRanges[0].end);
      var span = Math.max(DAY, finish - origin + DAY);

      var gantt = document.createElement("div");
      gantt.className = "plan-gantt";
      gantt.setAttribute("role", "img");
      gantt.setAttribute("aria-label", "목표 심사일 기준 역산 준비 일정 간트 차트");

      var head = document.createElement("div");
      head.className = "plan-gantt-head";
      head.innerHTML = "<div class=\"spacer\"></div>";
      var months = document.createElement("div");
      months.className = "plan-months";
      var cursor = new Date(origin.getFullYear(), origin.getMonth(), 1);
      var endMonth = new Date(finish.getFullYear(), finish.getMonth(), 1);
      while (cursor <= endMonth) {
        var mark = document.createElement("span");
        mark.className = "plan-month";
        var pct = ((cursor - origin) / span) * 100;
        if (pct >= -2 && pct <= 102) {
          mark.style.left = Math.max(0, Math.min(100, pct)) + "%";
          mark.textContent = cursor.getFullYear() + "." + String(cursor.getMonth() + 1).padStart(2, "0");
          months.appendChild(mark);
        }
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      }
      head.appendChild(months);
      gantt.appendChild(head);

      schedRanges.forEach(function (range, index) {
        var row = document.createElement("div");
        row.className = "plan-gantt-row";
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.setAttribute("aria-pressed", index === activePhase ? "true" : "false");
        var label = document.createElement("div");
        label.className = "plan-label";
        label.innerHTML = "<strong>" + range.name + "</strong><span>" + fmt(range.start) + " ~ " + fmt(range.end) + "</span>";
        var track = document.createElement("div");
        track.className = "plan-track";
        var bar = document.createElement("span");
        bar.className = "plan-bar group-" + range.group + (range.past ? " is-past" : "");
        var left = ((range.start - origin) / span) * 100;
        var width = ((range.end - range.start + DAY) / span) * 100;
        bar.style.left = Math.max(0, left) + "%";
        bar.style.width = Math.max(0.8, width) + "%";
        bar.title = range.name + " · " + fmt(range.start) + " ~ " + fmt(range.end);
        track.appendChild(bar);
        row.appendChild(label);
        row.appendChild(track);
        row.addEventListener("click", function () { setActivePhase(index); });
        row.addEventListener("mouseenter", function () { setActivePhase(index); });
        row.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActivePhase(index);
          }
        });
        gantt.appendChild(row);
      });

      host.appendChild(gantt);

      var legend = document.createElement("div");
      legend.className = "plan-gantt-legend";
      legend.innerHTML =
        "<span><i class=\"lg-prep\"></i>준비·컨설팅 단계</span>" +
        "<span><i class=\"lg-ops\"></i>고객 운영 기간</span>" +
        "<span><i class=\"lg-audit\"></i>인증기관 일정</span>";
      host.appendChild(legend);

      var detail = document.createElement("div");
      detail.className = "plan-detail";
      detail.id = "plan-detail";
      host.appendChild(detail);
      if (activePhase >= schedRanges.length) activePhase = 0;
      setActivePhase(activePhase);
    }

    function renderStatus(target, start, today, daysLeft) {
      var verdict = $("p-verdict");
      if (!verdict) return;
      clear(verdict);
      if (target <= today) {
        verdict.className = "plan-status is-warn";
        verdict.innerHTML =
          "<div class=\"status-line\"><span class=\"status-badge\">목표일 경과</span>" +
          "<span class=\"status-msg\">목표 심사일이 오늘 이전입니다. 날짜를 다시 선택해 주세요.</span></div>";
        return;
      }
      if (daysLeft >= 0) {
        verdict.className = "plan-status is-ok";
        verdict.innerHTML =
          "<div class=\"status-line\"><span class=\"status-badge\">일정 가능</span>" +
          "<span class=\"status-msg\">늦어도 <b>" + fmt(start) + "</b>까지 착수하면 권장 일정을 유지할 수 있습니다.</span></div>";
        return;
      }
      var shortWeeks = Math.ceil(-daysLeft / 7);
      var adjustFocus = "현황 분석·GAP ~ 보호대책·정책";
      if (shortWeeks <= 4) adjustFocus = "착수·범위 정의 ~ 현황 분석·GAP";
      else if (shortWeeks >= 12) adjustFocus = "착수 전 범위 축소와 앞 단계 병행";
      verdict.className = "plan-status is-warn";
      var reuse = (on("h-iso") || on("h-isms"))
        ? " 보유 인증 증적을 다시 쓰면 앞 준비 단계를 줄일 수 있습니다."
        : "";
      verdict.innerHTML =
        "<div class=\"status-line\"><span class=\"status-badge\">부족 약 " + shortWeeks + "주</span>" +
        "<span class=\"status-msg\">권장 착수일 <b>" + fmt(start) + "</b> 기준으로 일정이 부족합니다.</span></div>" +
        "<p class=\"status-adjust\">우선 조정 구간: <b style=\"color:var(--ink);font-weight:500\">" + adjustFocus + "</b>. 신청 전 관리체계 운영 2개월은 줄이기 어렵습니다.</p>" +
        "<details><summary>가능한 일정 조정 방안</summary>" +
        "<p>범위를 좁히거나 분석·대책 단계를 병행하는 단축 일정이 필요합니다." + reuse +
        " 목표 심사일을 뒤로 미루면 권장 일정으로 다시 맞출 수 있습니다.</p></details>";
    }

    function plan() {
      var value = $("p-target").value;
      var steps = $("p-steps");
      clear(steps);
      clear($("plan-summary"));
      clear($("sched-cal"));
      clear($("p-verdict"));
      var target = parseIso(value);
      if (!value || !target) {
        var verdict = $("p-verdict");
        if (verdict) {
          verdict.className = "plan-status";
          verdict.textContent = "목표 심사 시작일을 선택하세요.";
        }
        lastPlan = null;
        schedRanges = [];
        return;
      }
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      schedRanges = buildRanges(target, today);
      schedRanges.forEach(function (range) {
        if (steps) {
          var li = document.createElement("li");
          li.textContent = fmt(range.start) + " ~ " + fmt(range.end) + " " + range.name;
          steps.appendChild(li);
        }
      });
      var start = new Date(target.getTime() - 30 * 7 * DAY);
      var daysLeft = Math.round((start - today) / DAY);
      lastPlan = { target: target, start: start, late: start < today };
      renderSummary(target, start, today, daysLeft);
      renderGantt();
      renderStatus(target, start, today, daysLeft);
    }

    navi.addEventListener("change", function () { diagnose(); plan(); });
    navi.addEventListener("submit", function (e) { e.preventDefault(); });
    $("p-target").addEventListener("change", plan);
    $("p-target").addEventListener("input", plan);
    diagnose();
    plan();

    var toContact = $("to-contact");
    if (toContact) {
      toContact.addEventListener("click", function () {
        var sel = $("q-sector");
        var lines = ["[셀프 진단 결과]", "업종: " + sel.options[sel.selectedIndex].text];
        var held = [["h-isms", "ISMS"], ["h-ismsp", "ISMS-P"], ["h-iso", "ISO 27001"]].filter(function (pair) {
          return on(pair[0]);
        }).map(function (pair) { return pair[1]; });
        lines.push("보유 인증: " + (held.length ? held.join(", ") : "없음"));
        lastOut.forEach(function (row) {
          lines.push("- [" + BADGE[row[0]][1] + "] " + row[1]);
        });
        if (lastPlan) {
          lines.push("목표 인증심사일: " + fmt(lastPlan.target) + " / 권장 착수일: " + fmt(lastPlan.start) + (lastPlan.late ? " (권장 일정보다 늦음)" : ""));
        }
        var text = lastOut.map(function (row) { return row[1]; }).join(" ");
        var areas = [];
        if (/ISMS/.test(text)) areas.push("c1");
        if (/ISO\/IEC 27001|ISO 27001/.test(text)) areas.push("c2");
        if (/개인정보|ISMS-P/.test(text)) areas.push("c3");
        if (/AI|42001/.test(text)) areas.push("c5");
        var payload = {
          message: lines.join("\n"),
          pii: on("q-pii"),
          areas: areas
        };
        try { sessionStorage.setItem("tbell-consult-v01", JSON.stringify(payload)); } catch (err) { /* storage unavailable */ }
        location.href = "contact.html?d=" + encodeURIComponent(JSON.stringify(payload));
      });
    }
  }

  var form = $("inquiry");
  if (form) {
    var data = null;
    try {
      var fromUrl = new URLSearchParams(location.search).get("d");
      if (fromUrl) data = JSON.parse(fromUrl);
    } catch (err) { data = null; }
    if (!data) {
      try {
        var raw = sessionStorage.getItem("tbell-consult-v01");
        if (raw) data = JSON.parse(raw);
      } catch (err) { data = null; }
    }
    if (data) {
      if (data.message && !$("f-msg").value) $("f-msg").value = data.message;
      if (data.pii && $("sv-pii") && !$("sv-pii").value) $("sv-pii").value = "100만 명 이상";
      (data.areas || []).forEach(function (id) {
        var box = $(id);
        if (box) box.checked = true;
      });
      var note = $("import-note");
      if (note && data.message) note.hidden = false;
    }

    var msg = $("form-msg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.classList.remove("err");
      var name = form.elements.name.value.trim();
      var company = form.elements.company.value.trim();
      var email = form.elements.email.value.trim();
      if (!name || !company) {
        msg.textContent = "이름과 회사명을 입력해 주세요.";
        msg.classList.add("err");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "이메일 주소 형식을 확인해 주세요.";
        msg.classList.add("err");
        return;
      }
      if (!$("f-agree").checked) {
        msg.textContent = "개인정보 수집·이용에 동의해 주세요.";
        msg.classList.add("err");
        return;
      }
      msg.textContent = "입력이 확인되었습니다. 시안이라 실제로 전송되지는 않습니다.";
      try { sessionStorage.removeItem("tbell-consult-v01"); } catch (err) { /* ignore */ }
    });
  }
})();
