export default function DashboardContent({ data }) {
  const { metadata, product_info, dashboard_data, tariff_measures, nontariff_measures } = data;

  return (
    <>
      <h2>Аналитический дашборд</h2>

      {/* Metadata */}
      <section>
        <h3>Информация о товаре</h3>
        <table>
          <tbody>
            <tr>
              <td>Код ТН ВЭД:</td>
              <td>{metadata.tnved_code}</td>
            </tr>
            <tr>
              <td>Наименование:</td>
              <td>{metadata.tnved_name}</td>
            </tr>
            <tr>
              <td>Продукт:</td>
              <td>{metadata.product_name}</td>
            </tr>
            <tr>
              <td>Текущая ставка:</td>
              <td>{metadata.current_tariff}</td>
            </tr>
            <tr>
              <td>Ставка ВТО:</td>
              <td>{(product_info.wto_rate * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Import Dynamics */}
      <section>
        <h3>Динамика импорта (3 года)</h3>
        <table>
          <thead>
            <tr>
              <th>Год</th>
              <th>Объем (млн USD)</th>
              <th>Вес (тонн)</th>
            </tr>
          </thead>
          <tbody>
            {dashboard_data.import_dynamics.map((item) => (
              <tr key={item.year}>
                <td>{item.year}</td>
                <td>{item.value_mln_usd.toFixed(2)}</td>
                <td>{item.weight_tons.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Production */}
      <section>
        <h3>Динамика производства (3 года)</h3>
        <table>
          <thead>
            <tr>
              <th>Год</th>
              <th>Объем (млн USD)</th>
            </tr>
          </thead>
          <tbody>
            {dashboard_data.production_dynamics.map((item) => (
              <tr key={item.year}>
                <td>{item.year}</td>
                <td>{item.value_mln_usd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Consumption */}
      <section>
        <h3>Динамика потребления (3 года)</h3>
        <table>
          <thead>
            <tr>
              <th>Год</th>
              <th>Объем (млн USD)</th>
            </tr>
          </thead>
          <tbody>
            {dashboard_data.consumption_dynamics.map((item) => (
              <tr key={item.year}>
                <td>{item.year}</td>
                <td>{item.value_mln_usd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Geography */}
      <section>
        <h3>География импорта (топ-10)</h3>
        <table>
          <thead>
            <tr>
              <th>Страна</th>
              <th>Объем (млн USD)</th>
              <th>Доля (%)</th>
            </tr>
          </thead>
          <tbody>
            {dashboard_data.import_geography
              .filter(c => c.share_percent > 0)
              .slice(0, 10)
              .map((country, idx) => (
                <tr key={idx}>
                  <td>{country.country}</td>
                  <td>{country.value.toFixed(2)}</td>
                  <td>{country.share_percent.toFixed(2)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* Top 5 Prices */}
      <section>
        <h3>Средняя цена (топ-5)</h3>
        <table>
          <thead>
            <tr>
              <th>Страна</th>
              <th>Цена (USD/т)</th>
              <th>Объем (млн USD)</th>
            </tr>
          </thead>
          <tbody>
            {dashboard_data.top5_contract_prices.map((item, idx) => (
              <tr key={idx}>
                <td>{item.country}</td>
                <td>{item.avg_price_usd_per_ton.toFixed(2)}</td>
                <td>{item.total_value_mln_usd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Recommendations */}
      <section>
        <h3>Рекомендации по мерам</h3>
        <div>
          <h4>Тарифные меры:</h4>
          <ul>
            {tariff_measures.measures.map((measure, idx) => (
              <li key={idx}>
                {measure} - {tariff_measures.reasoning[idx]}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Нетарифные меры:</h4>
          <ul>
            {nontariff_measures.measures.map((measure, idx) => (
              <li key={idx}>
                {measure} - {nontariff_measures.reasoning[idx]}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
