const StatCard = ({ title, value }) => {
  return (
    <div className="stat-card card card--glow">
      <span className="label">{title}</span>
      <span className="value">{value}</span>

      <div className="spark">
        <i></i>
      </div>
    </div>
  );
};

export default StatCard;
