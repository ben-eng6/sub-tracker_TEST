// 구독 데이터(subscription) 예시
// {
//   "id": "sub_1",
//   "name": "넷플릭스",
//   "amount": 13500,
//   "cycle": "monthly", // "monthly" 또는 "yearly"
//   "nextPaymentDate": "2024-06-15",
//   "category": "영상",
//   "paymentMethod": "신한카드" // 또는 "KB카드", "현대카드", "BC카드"
// }

// getMonthlyAmount(subscription)
// 설명: 하나의 구독 항목을 받아, 그 항목을 월 기준 비용으로 환산한 값을 반환한다.
// 입력: subscription 객체
// 필수 속성: amount(금액), cycle(결제주기), paymentMethod(결제수단) 등
// 동작:
//   1) 만약 cycle이 "yearly"이면 amount를 12로 나눈 뒤, 월 단위 비용으로 바꾼다.
//   2) Math.round(...)를 사용해서 12로 나눈 값이 소수점이 나오면 반올림해 정수로 만든다.
//   3) 만약 cycle이 "monthly"이면 amount 그대로 반환한다.
//   4) 그 외 값은 지원하지 않으므로 Invalid cycle value 오류를 던진다.
function getMonthlyAmount(subscription) {
  if (subscription.cycle === "yearly") {
    return Math.round(subscription.amount / 12);
  } else if (subscription.cycle === "monthly") {
    return subscription.amount;
  } else {
    throw new Error("Invalid cycle value");
  }
}

// getTotalMonthlyAmount(subscriptions)
// 설명: 구독 데이터 배열을 받아, 각 구독의 월 기준 금액을 합산해 한 번에 월 총합을 반환한다.
// 입력: subscriptions 배열
// 동작:
//   1) reduce는 누적값 total을 0으로 시작한다.
//   2) 각 구독 sub을 순회하며 getMonthlyAmount(sub)를 호출해 월 단위 환산 금액을 구한다.
//   3) 현재까지 누적한 total에 그 월 금액을 더해서 다시 total로 저장한다.
//   4) 마지막으로 누적값을 반환한다.
function getTotalMonthlyAmount(subscriptions) {
  return subscriptions.reduce((total, sub) => total + getMonthlyAmount(sub), 0);
}

// getTotalYearlyAmount(subscriptions)
// 설명: 구독 목록 배열을 받아 연간 지출 총액을 계산해 반환한다.
// 입력: subscriptions 배열
// 동작:
//   1) 먼저 getTotalMonthlyAmount(subscriptions)를 호출해 월 합계를 만든다.
//   2) 그 월 합계를 12배 해 연간 지출 금액을 계산한다.
//   3) 연간 지출 총액을 반환한다.
function getTotalYearlyAmount(subscriptions) {
  return getTotalMonthlyAmount(subscriptions) * 12;
}

// getDaysUntilNextPayment(today, nextPaymentDate)
// 설명: 오늘 날짜와 결제 예정일 사이의 남은 일수를 계산해 반환한다.
// 입력:
//   today: "YYYY-MM-DD" 형태의 문자열
//   nextPaymentDate: "YYYY-MM-DD" 형태의 문자열
// 동작:
//   1) 문자열을 new Date(...)에 넣어 실제 날짜 객체로 변환한다.
//   2) T00:00:00을 붙여 시간을 자정으로 맞춘다.
//   3) paymentDate - todayDate의 시간 차이를 밀리초로 계산한다.
//   4) 밀리초를 하루 단위(1000 * 60 * 60 * 24)로 나눈 뒤 반올림해 정수 일수로 만든다.
// 반환:
//   - 오늘이면 0
//   - 결제일이 미래면 양수(남은 일수)
//   - 결제일이 이미 지났으면 음수
function getDaysUntilNextPayment(today, nextPaymentDate) {
  const todayDate = new Date(today + "T00:00:00");
  const paymentDate = new Date(nextPaymentDate + "T00:00:00");
  const diffTime = paymentDate - todayDate;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// getMonthlyAmountByCategory(subscriptions)
// 설명: 구독 배열을 받아 카테고리별 월 합계를 객체 형태로 묶어 반환한다.
// 입력: subscriptions 배열
// 반환 예시: { "영상": 13500, "음악": 10900 }
// 동작:
//   1) reduce의 누적 객체 acc는 빈 객체 {}로 시작한다.
//   2) 각 구독 sub을 순회하며 getMonthlyAmount(sub)로 월 환산 금액을 계산한다.
//   3) acc[sub.category]가 이미 있으면 그 카테고리의 누적 합에 금액을 더한다.
//   4) 없으면 해당 카테고리에 금액을 새로 저장한다.
//   5) 최종적으로 카테고리 이름을 키로 하는 {카테고리: 월합계} 객체를 반환한다.
function getMonthlyAmountByCategory(subscriptions) {
  return subscriptions.reduce((acc, sub) => {
    const monthlyAmount = getMonthlyAmount(sub);
    if (acc[sub.category]) {
      acc[sub.category] += monthlyAmount;
    } else {
      acc[sub.category] = monthlyAmount;
    }
    return acc;
  }, {});
}

// getTotalMonthlyAmountByPaymentMethod(subscriptions, paymentMethod)
// 설명: 특정 카드/결제수단 하나만 선택해 해당 결제수단에 속한 구독들의 월 합계를 반환한다.
// 입력:
//   subscriptions: 구독 데이터 배열
//   paymentMethod: "신한카드" 또는 "KB카드" 등 결제수단 문자열
// 동작:
//   1) reduce의 누적값 total을 0으로 시작한다.
//   2) 배열을 순회하며 sub.paymentMethod가 입력 받은 paymentMethod와 같으면
//      해당 구독의 getMonthlyAmount(sub)를 total에 더한다.
//   3) 같은 결제수단이 아니면 total은 그대로 유지한다.
//   4) 최종 누적값을 반환한다.
function getTotalMonthlyAmountByPaymentMethod(subscriptions, paymentMethod) {
  return subscriptions.reduce((total, sub) => {
    if (sub.paymentMethod === paymentMethod) {
      return total + getMonthlyAmount(sub);
    }
    return total;
  }, 0);
}

// getMonthlyAmountByPaymentMethod(subscriptions)
// 설명: 모든 구독 데이터를 카드(결제수단)별로 묶어, 카드 이름을 key로 하고 월 기준 금액 총합을 value로 갖는 객체를 반환한다.
// 입력: subscriptions 배열
// 반환 예시: { "신한카드": 13500, "현대카드": 10900 }
// 동작:
//   1) reduce의 누적 객체 acc는 빈 객체 {}로 시작한다.
//   2) 각 구독 sub을 순회하며 getMonthlyAmount(sub)로 월 금액을 계산한다.
//   3) acc[sub.paymentMethod]가 이미 있으면 해당 결제수단의 누적 합계에 더한다.
//   4) 없으면 새 결제수단 키를 만들고 금액을 저장한다.
//   5) 최종적으로 {결제수단: 월합계} 형태의 객체를 반환한다.
function getMonthlyAmountByPaymentMethod(subscriptions) {
  return subscriptions.reduce((acc, sub) => {
    const monthlyAmount = getMonthlyAmount(sub);
    if (acc[sub.paymentMethod]) {
      acc[sub.paymentMethod] += monthlyAmount;
    } else {
      acc[sub.paymentMethod] = monthlyAmount;
    }
    return acc;
  }, {});
}
