import type { Project } from "@reaper/shared";
import fs from "fs";
import path from "path";

class ProjectsController {
  projects: Project[] = [];

  constructor() {
    this.loadProjects();
  }

  loadProjects() {
    const projectsDir = process.env.DEFAULT_REAPER_PROJECTS_DIR;
    if (!projectsDir) {
      console.error("DEFAULT_REAPER_PROJECTS_DIR is not set in .env");
      return;
    }
    try {
      // 1. Lê o diretório principal (equivalente ao std::filesystem::directory_iterator(path))
      const entries = fs.readdirSync(projectsDir, { withFileTypes: true });

      const loadedProjects: Project[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const folderPath = path.join(projectsDir, entry.name);

          // 2. Lê o conteúdo da subpasta (segundo loop do C++)
          const files = fs.readdirSync(folderPath, { withFileTypes: true });

          for (const file of files) {
            const extension = path.extname(file.name).toUpperCase();
            const fileNameWithoutExt = path.parse(file.name).name;

            // 3. Aplica a mesma lógica de validação:
            // - É um arquivo regular
            // - Nome do arquivo (sem ext) é igual ao nome da pasta
            // - Extensão é .RPP
            if (
              file.isFile() &&
              extension === ".RPP" &&
              fileNameWithoutExt === entry.name
            ) {
              // 4. Validação do gênero (os 2 primeiros caracteres do nome do arquivo)
              try {
                const genrePrefix = file.name.substring(0, 2);
                const genreIndex = parseInt(genrePrefix, 10);

                if (!isNaN(genreIndex) && genreIndex >= 0 && genreIndex < 9) {
                  loadedProjects.push({
                    name: entry.name, // Nome da pasta
                    path: path.join(folderPath, file.name), // Caminho completo do .RPP
                  });
                }
              } catch (err) {
                console.error(
                  `Erro ao processar gênero do projeto ${file.name}:`,
                  err,
                );
              }
            }
          }
        }
      }

      this.projects = loadedProjects;
      console.log(
        `[Projects] ${this.projects.length} projetos carregados com sucesso.`,
      );
    } catch (error) {
      console.error("Erro ao ler diretório de projetos:", error);
    }
  }

  // Método auxiliar para retornar a lista quando necessário
  getProjects(): Project[] {
    return this.projects;
  }
}

export default ProjectsController;
