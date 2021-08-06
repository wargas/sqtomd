import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [aulaId, setaulaId] = useState("");

  useEffect(() => {
    if (questions.length > 0) {
      setText(
        questions
          .map((question) => {
            return `
${question.statement
  .replace(/<\/?(div|br)>/gi, "\\n\\n")
  .replace(/(\\n){2,}/gi, "\n")
  .replace(/\<\!-- END\:IMAGE_TO_REPLACE \-\-\>/gi, "")
  .replace(/\<\!-- BEGIN\:IMAGE_TO_REPLACE \-\-\>/gi, "")
  .replace(/<img src="(.*)">/gi, "![]($1)")}
***
${question.alternatives
  .filter(() => question.alternatives.length > 2)
  .map((alt) => alt.body)
  .join("\n***\n")}
${question.alternatives.length > 2 ? "***" : ""}
${question.gabarito}
****
        `;
          })
          .join("\n")
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .join("\n")
          .replace(/\n{1,}/, "")
      );
    } else {
      setText("");
    }
  }, [questions]);

  useEffect(() => {
    if (questions.length > 0) {
      setComentarios(
        questions
          .map((questao, index) => {
            const texto = questao.solution.brief
              .replace(/\n/gi, "")
              .replace(/<\/?(div|br)>/gi, "\\n\\n")
              .replace(/(\\n){1,}/gi, "\\n")
              .replace(/\<\!-- END\:IMAGE_TO_REPLACE \-\-\>/gi, "")
              .replace(/\<\!-- BEGIN\:IMAGE_TO_REPLACE \-\-\>/gi, "")

            return `insert into comentarios (aula_id, user_id, questao, texto) values (${aulaId}, 1, ${index}, '${texto}');`;
          })
          .join("\n")
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .join("\n")
      );
    }
  }, [questions, aulaId]);

  const handlePaste = (event) => {
    try {
      const { data } = JSON.parse(event.clipboardData.getData("Text"));

      console.log(event.clipboardData.getData("Text"));

      const currents = data.map((question) => {
        const correta = question.alternatives.find((item) => item.correct);
        let gabarito = "X";

        if (question.alternatives.length > 2) {
          const optionsAE = ["A", "B", "C", "D", "E"];

          gabarito = optionsAE[correta.position];
        } else {
          const optionsCE = ["C", "E"];

          gabarito = optionsCE[correta.position];
        }

        return { ...question, gabarito };
      });

      setQuestions((old) => [...old, ...currents]);
    } catch (error) {
      console.log("dados invalidos");
    }

    event.target.value = "";
  };

  return (
    <div
      style={{ height: "100vh" }}
      className="container d-flex flex-column py-3"
    >
      <h1>
        Inserir o texto{" "}
        <button className="btn btn-sm" onClick={() => setQuestions([])}>
          Zerar
        </button>
      </h1>
      <textarea
        onPaste={handlePaste}
        // onChange={handlerChange}
        className="form-control"
      ></textarea>
      <h1>Texto para questões ({questions.length})</h1>
      <textarea
        style={{ height: "30%" }}
        value={text}
        className="form-control"
      ></textarea>
      <h1>
        Sql para comentários{" "}
        <input
          value={aulaId}
          onChange={(ev) => setaulaId(ev.target.value)}
          type="text"
          style={{ width: "50px", display: "inline" }}
          className="form-control"
        />
      </h1>
      <textarea
        style={{ height: "30%" }}
        value={comentarios}
        className="form-control"
      ></textarea>
    </div>
  );
}

export default App;
