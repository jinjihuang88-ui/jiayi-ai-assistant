export default function Home() {
  return (
    <main style={{ padding: 40, maxWidth: 600 }}>
      <h2>IMM1294 – Study Permit Application</h2>

      <form method="post" action="http://localhost:5001/submit">
        <label>Family Name</label><br />
        <input name="family_name" /><br /><br />

        <label>Given Name</label><br />
        <input name="given_name" /><br /><br />

        <label>Date of Birth</label><br />
        <input type="date" name="dob" /><br /><br />

        <label>Passport Number</label><br />
        <input name="passport" /><br /><br />

        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
